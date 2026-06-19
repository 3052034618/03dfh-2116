import type {
  PlayerProfile,
  SchedulePlayer,
  Role,
  Script,
  RoleRelation,
  MatchCell,
  Schedule,
  AssignmentSuggestion,
  AssignmentPair,
  AssignmentWarning,
  AssignmentReview,
  TagAdjustment,
} from '@/types';

// ============ 内部辅助类型 ============
interface ScoreComponent {
  raw: number;
  max: number;
  weight: number;
}

// ============ 内部工具函数 ============
function getPlayerLevel(totalGames: number): 'newbie' | 'normal' | 'veteran' | 'expert' {
  if (totalGames < 3) return 'newbie';
  if (totalGames < 15) return 'normal';
  if (totalGames < 30) return 'veteran';
  return 'expert';
}

function levelToDifficultyRange(level: string): [number, number] {
  switch (level) {
    case 'newbie': return [1, 2];
    case 'normal': return [2, 3];
    case 'veteran': return [3, 4];
    case 'expert': return [4, 5];
    default: return [2, 3];
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalize(component: ScoreComponent): number {
  const ratio = component.max === 0 ? 0 : clamp(component.raw / component.max, -1, 1);
  return ratio * component.max * (component.weight / 100);
}

function findRelation(
  allRelations: RoleRelation[],
  roleIdA: string,
  roleIdB: string
): RoleRelation | undefined {
  return allRelations.find(
    (r) =>
      (r.roleA === roleIdA && r.roleB === roleIdB) ||
      (r.roleA === roleIdB && r.roleB === roleIdA)
  );
}

// ============ 核心函数：calculateMatchScore ============
export function calculateMatchScore(
  player: PlayerProfile,
  schedulePlayer: SchedulePlayer,
  role: Role,
  script: Script,
  allRelations: RoleRelation[],
  allPlayers: Record<string, PlayerProfile>,
  allSchedulePlayers: SchedulePlayer[]
): MatchCell {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let hardViolation = false;

  // ---------- 基础标签匹配分（满分40）----------
  let baseRaw = 0;
  const baseMax = 40;
  const baseComponents: { raw: number; max: number; name: string; reason?: string }[] = [];

  // 性别限制
  if (role.gender !== 'any') {
    if (role.gender === 'male' && player.gender === 'female') {
      hardViolation = true;
      warnings.push('性别硬约束冲突：角色要求男性，玩家为女性');
    } else if (role.gender === 'female' && player.gender === 'male') {
      hardViolation = true;
      warnings.push('性别硬约束冲突：角色要求女性，玩家为男性');
    } else {
      baseComponents.push({ raw: 30, max: 30, name: '性别', reason: '性别匹配' });
    }
  } else {
    baseComponents.push({ raw: 15, max: 30, name: '性别', reason: '性别无限制' });
  }

  // 难度适配
  const playerLevel = getPlayerLevel(player.totalGames);
  const [minDiff, maxDiff] = levelToDifficultyRange(playerLevel);
  let difficultyScore = 0;
  if (role.difficulty >= minDiff && role.difficulty <= maxDiff) {
    difficultyScore = 20;
    reasons.push(`难度适配：玩家${getLevelLabel(playerLevel)}，角色难度${role.difficulty}在适配区间`);
  } else {
    const diff = role.difficulty < minDiff ? minDiff - role.difficulty : role.difficulty - maxDiff;
    difficultyScore = -Math.min(20, diff * 10);
    if (difficultyScore < 0) {
      warnings.push(`难度偏离：玩家${getLevelLabel(playerLevel)}，角色难度${role.difficulty}偏${role.difficulty < minDiff ? '低' : '高'}`);
    }
  }
  baseComponents.push({ raw: difficultyScore, max: 20, name: '难度适配' });

  // 情感浓度
  const emotionWeight = player.tagWeights['emotion'] ?? 50;
  const emotionRatio = emotionWeight / 100;
  const emotionMatch = (role.emotionLevel / 5 - 0.5) * emotionRatio * 30;
  if (emotionMatch > 5) {
    reasons.push(`情感浓度匹配：角色情感等级${role.emotionLevel}，玩家情感偏好${emotionWeight}%`);
  } else if (emotionMatch < -5) {
    warnings.push(`情感浓度不匹配：角色情感等级${role.emotionLevel}，玩家情感偏好${emotionWeight}%`);
  }
  baseComponents.push({ raw: emotionMatch, max: 15, name: '情感浓度' });

  // 推理参与度
  const deductionWeight = player.tagWeights['deduction'] ?? 50;
  const deductionRatio = deductionWeight / 100;
  const deductionMatch = (role.deductionLevel / 5 - 0.5) * deductionRatio * 30;
  if (deductionMatch > 5) {
    reasons.push(`推理参与度匹配：角色推理等级${role.deductionLevel}，玩家推理偏好${deductionWeight}%`);
  } else if (deductionMatch < -5) {
    warnings.push(`推理参与度不匹配：角色推理等级${role.deductionLevel}，玩家推理偏好${deductionWeight}%`);
  }
  baseComponents.push({ raw: deductionMatch, max: 15, name: '推理参与度' });

  // 新手友好度
  if (player.totalGames < 3) {
    if (role.beginnerFriendly) {
      baseComponents.push({ raw: 20, max: 20, name: '新手友好', reason: '新玩家 + 新手友好角色' });
    }
    if (role.difficulty >= 4) {
      baseComponents.push({ raw: -30, max: 20, name: '新手友好' });
      warnings.push('新手风险：新玩家被分配到高难度角色');
    }
  }

  baseRaw = baseComponents.reduce((sum, c) => sum + c.raw, 0);
  const baseScore = normalize({ raw: baseRaw, max: 120, weight: 40 }) * (120 / baseMax);
  const baseFinal = clamp(baseScore, 0, 40);

  // ---------- 玩家偏好匹配分（满分30）----------
  let prefRaw = 0;
  const survey = schedulePlayer.surveyResponse;

  if (survey) {
    // 题材偏好
    const genreMatches = survey.preferredGenres.filter((g) => script.genre.includes(g));
    if (genreMatches.length > 0) {
      prefRaw += genreMatches.length * 10;
      reasons.push(`题材偏好匹配：${genreMatches.join('、')}`);
    }

    // 忌讳内容
    const tabooHits = survey.tabooContent.filter((t) => script.genre.includes(t) || role.tags.includes(t));
    if (tabooHits.length > 0) {
      prefRaw -= tabooHits.length * 50;
      warnings.push(`忌讳内容命中：${tabooHits.join('、')}`);
    }

    // 社交风格 + 主持型
    if (role.hostType) {
      if (survey.socialStyle === 'introvert') {
        prefRaw -= 40;
        warnings.push('社交风格冲突：社恐玩家分配到主持型角色');
      } else if (survey.socialStyle === 'social') {
        prefRaw += 20;
        reasons.push('社牛适配主持型角色');
      }
      if (survey.willingToLead) {
        prefRaw += 15;
        reasons.push('玩家主动愿意带动气氛');
      }
    }
  }

  const prefScore = normalize({ raw: prefRaw, max: 120, weight: 30 }) * (120 / 30);
  const prefFinal = clamp(prefScore, -30, 30);

  // ---------- 关系约束分（满分20）----------
  let relationRaw = 0;
  const loverSchedulePlayer = allSchedulePlayers.find(
    (sp) =>
      sp.relationType === 'lover' &&
      (sp.acquaintanceWith.includes(player.id) || schedulePlayer.acquaintanceWith.includes(sp.playerId))
  );

  if (loverSchedulePlayer && loverSchedulePlayer.playerId !== player.id) {
    for (const otherSP of allSchedulePlayers) {
      if (otherSP.playerId === player.id) continue;
      if (otherSP.relationType === 'lover') {
        for (const otherRole of script.roles) {
          if (otherRole.id === role.id) continue;
          const rel = findRelation(allRelations, role.id, otherRole.id);
          if (rel) {
            if (rel.type === 'lover') {
              relationRaw += 25;
              reasons.push('情侣玩家 + 情侣角色关系加成');
            } else if (rel.type === 'enemy' && rel.intensity >= 2) {
              relationRaw -= 50;
              warnings.push('高风险：情侣玩家被分配到强对立角色');
            }
          }
        }
      }
    }
  }

  // 熟人同阵营/家族
  const acquaintanceIds = schedulePlayer.acquaintanceWith;
  if (acquaintanceIds && acquaintanceIds.length > 0) {
    for (const otherSP of allSchedulePlayers) {
      if (!acquaintanceIds.includes(otherSP.playerId)) continue;
      for (const otherRole of script.roles) {
        if (otherRole.id === role.id) continue;
        const rel = findRelation(allRelations, role.id, otherRole.id);
        if (rel && (rel.type === 'family' || rel.type === 'partner')) {
          relationRaw += 10;
          reasons.push('熟人玩家分配到同阵营/家族角色');
          break;
        }
      }
    }
  }

  const relationScore = normalize({ raw: relationRaw, max: 60, weight: 20 }) * (60 / 20);
  const relationFinal = clamp(relationScore, -20, 20);

  // ---------- 经验修正分（满分10）----------
  let expRaw = 0;
  const roleTypeTags = role.tags;
  for (const past of player.pastAssignments) {
    const tagOverlap = past.roleTags.filter((t) => roleTypeTags.includes(t));
    if (tagOverlap.length > 0) {
      if (past.score >= 4) {
        expRaw += 8;
        reasons.push(`历史好评：曾扮演${tagOverlap.join('、')}类型角色且反馈良好`);
      } else if (past.score <= 2) {
        expRaw -= 8;
        warnings.push(`历史落差：曾扮演${tagOverlap.join('、')}类型角色且反馈较差`);
      }
      break;
    }
  }

  const expScore = normalize({ raw: expRaw, max: 8, weight: 10 }) * (8 / 10);
  const expFinal = clamp(expScore, -10, 10);

  // ---------- 汇总 ----------
  let finalScore = 0;
  if (hardViolation) {
    finalScore = 0;
  } else {
    finalScore = Math.round(clamp(baseFinal + prefFinal + relationFinal + expFinal, 0, 100));
  }

  return {
    playerId: player.id,
    roleId: role.id,
    score: finalScore,
    reasons,
    warnings,
  };
}

// ============ 核心函数：generateAssignment ============
export function generateAssignment(
  schedule: Schedule,
  script: Script,
  players: PlayerProfile[]
): AssignmentSuggestion {
  const allPlayersMap: Record<string, PlayerProfile> = {};
  players.forEach((p) => {
    allPlayersMap[p.id] = p;
  });

  const schedulePlayers = schedule.players;
  const roles = script.roles;
  const allRelations = script.relations;

  // ---------- Step 1: 生成 matchMatrix ----------
  const matchMatrix: MatchCell[][] = [];
  for (let i = 0; i < schedulePlayers.length; i++) {
    const row: MatchCell[] = [];
    const sp = schedulePlayers[i];
    const player = allPlayersMap[sp.playerId];
    if (!player) continue;
    for (let j = 0; j < roles.length; j++) {
      const cell = calculateMatchScore(
        player,
        sp,
        roles[j],
        script,
        allRelations,
        allPlayersMap,
        schedulePlayers
      );
      row.push(cell);
    }
    matchMatrix.push(row);
  }

  // ---------- Step 2: 贪心算法生成 recommendedPlan ----------
  const allCells: { cell: MatchCell; rowIdx: number; colIdx: number }[] = [];
  matchMatrix.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      allCells.push({ cell, rowIdx: ri, colIdx: ci });
    });
  });
  allCells.sort((a, b) => b.cell.score - a.cell.score);

  const usedPlayerIdx = new Set<number>();
  const usedRoleIdx = new Set<number>();
  const recommendedPlan: AssignmentPair[] = [];

  for (const { cell, rowIdx, colIdx } of allCells) {
    if (usedPlayerIdx.has(rowIdx) || usedRoleIdx.has(colIdx)) continue;
    usedPlayerIdx.add(rowIdx);
    usedRoleIdx.add(colIdx);
    recommendedPlan.push({
      playerId: cell.playerId,
      roleId: cell.roleId,
      isLocked: false,
    });
    if (recommendedPlan.length >= Math.min(schedulePlayers.length, roles.length)) break;
  }

  // ---------- Step 3: 生成 warnings ----------
  const warnings: AssignmentWarning[] = [];

  for (const pair of recommendedPlan) {
    const sp = schedulePlayers.find((s) => s.playerId === pair.playerId);
    const player = allPlayersMap[pair.playerId];
    const role = roles.find((r) => r.id === pair.roleId);
    if (!sp || !player || !role) continue;

    // 🔴 高警告：情侣分到对立角色
    if (sp.relationType === 'lover') {
      const otherLoverSP = schedulePlayers.find(
        (s) =>
          s.playerId !== pair.playerId &&
          s.relationType === 'lover' &&
          (s.acquaintanceWith.includes(pair.playerId) || sp.acquaintanceWith.includes(s.playerId))
      );
      if (otherLoverSP) {
        const otherPair = recommendedPlan.find((p) => p.playerId === otherLoverSP.playerId);
        if (otherPair) {
          const rel = findRelation(allRelations, pair.roleId, otherPair.roleId);
          if (rel && rel.type === 'enemy' && rel.intensity >= 2) {
            warnings.push({
              type: 'conflict',
              severity: 'high',
              playerIds: [pair.playerId, otherPair.playerId],
              roleIds: [pair.roleId, otherPair.roleId],
              message: '情侣玩家被分配到强对立角色，存在情感冲突风险',
              suggestion: '建议人工调整为情侣角色或非对立关系角色',
            });
          }
        }
      }
    }

    // 🔴 高警告：社恐拿到主持型
    if (sp.surveyResponse?.socialStyle === 'introvert' && role.hostType) {
      warnings.push({
        type: 'conflict',
        severity: 'high',
        playerIds: [pair.playerId],
        roleIds: [pair.roleId],
        message: '社恐玩家被分配到主持型/信息位角色，可能产生压力',
        suggestion: '建议更换为非主持型的安静角色',
      });
    }

    // 🔴 高警告：新手拿高难角色
    if (player.totalGames < 3 && role.difficulty >= 4) {
      warnings.push({
        type: 'conflict',
        severity: 'high',
        playerIds: [pair.playerId],
        roleIds: [pair.roleId],
        message: `新手玩家（${player.totalGames}场）被分配到难度${role.difficulty}的高难角色`,
        suggestion: '建议调整为新手友好或低难度角色',
      });
    }

    // 🟠 中警告：情感浓度高但玩家情感本反馈差
    if (role.emotionLevel >= 4) {
      const emotionWeight = player.tagWeights['emotion'] ?? 50;
      const badEmotionHistory = player.pastAssignments.some(
        (p) => p.score <= 2 && p.roleTags.some((t) => ['情感', '沉浸', '感动'].includes(t))
      );
      if (emotionWeight < 30 || badEmotionHistory) {
        warnings.push({
          type: 'risk',
          severity: 'medium',
          playerIds: [pair.playerId],
          roleIds: [pair.roleId],
          message: '情感浓度高的角色分配给情感偏好低/历史反馈差的玩家',
          suggestion: '关注玩家情绪，DM适时引导；或考虑调整分配',
        });
      }
    }
  }

  // 🟡 低警告：同车3+熟人可能抱团
  const acquaintanceGroups: string[][] = [];
  const visited = new Set<string>();
  for (const sp of schedulePlayers) {
    if (visited.has(sp.playerId)) continue;
    const group: string[] = [];
    const queue = [sp.playerId];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      group.push(cur);
      const curSP = schedulePlayers.find((s) => s.playerId === cur);
      if (curSP) {
        for (const aq of curSP.acquaintanceWith) {
          if (!visited.has(aq)) queue.push(aq);
        }
      }
    }
    if (group.length >= 3) {
      acquaintanceGroups.push(group);
    }
  }
  for (const group of acquaintanceGroups) {
    const roleIds = recommendedPlan
      .filter((p) => group.includes(p.playerId))
      .map((p) => p.roleId);
    warnings.push({
      type: 'manual_check',
      severity: 'low',
      playerIds: group,
      roleIds,
      message: `同车${group.length}位熟人玩家可能存在场外抱团风险`,
      suggestion: 'DM需提醒玩家避免场外信息，适当分配非核心阵营位置',
    });
  }

  const finalPlan = recommendedPlan.map((p) => ({ ...p }));

  return {
    scheduleId: schedule.id,
    generatedAt: new Date().toISOString(),
    matchMatrix,
    recommendedPlan,
    warnings,
    manualAdjusted: false,
    finalPlan,
  };
}

// ============ 核心函数：generateTagAdjustments ============
export function generateTagAdjustments(
  review: AssignmentReview,
  script: Script
): TagAdjustment[] {
  const adjustments: TagAdjustment[] = [];
  const roleTagMap: Record<string, Record<string, { pos: number; neg: number; total: number }>> = {};

  // 统计每个角色的标签反馈
  for (const feedback of review.perPlayerFeedback) {
    const role = script.roles.find((r) => r.id === feedback.roleId);
    if (!role) continue;

    if (!roleTagMap[role.id]) roleTagMap[role.id] = {};

    const isPositive = feedback.score >= 4;
    const isNegative = feedback.score <= 2;

    for (const tag of role.tags) {
      if (!roleTagMap[role.id][tag]) {
        roleTagMap[role.id][tag] = { pos: 0, neg: 0, total: 0 };
      }
      roleTagMap[role.id][tag].total++;
      if (isPositive) roleTagMap[role.id][tag].pos++;
      if (isNegative) roleTagMap[role.id][tag].neg++;
    }

    // 体验标签作为补充信号
    const positiveExpTags = ['沉浸', '感动', '爽感', '意难平', '上头', '精彩'];
    const negativeExpTags = ['无聊', '懵', '边缘', '坐牢', '割裂', '出戏'];
    for (const expTag of feedback.experienceTags) {
      for (const roleTag of role.tags) {
        if (!roleTagMap[role.id][roleTag]) continue;
        if (positiveExpTags.includes(expTag)) {
          roleTagMap[role.id][roleTag].pos += 0.5;
        }
        if (negativeExpTags.includes(expTag)) {
          roleTagMap[role.id][roleTag].neg += 0.5;
        }
      }
    }
  }

  // 生成调整建议
  for (const [roleId, tagStats] of Object.entries(roleTagMap)) {
    const role = script.roles.find((r) => r.id === roleId);
    if (!role) continue;

    for (const [tagName, stats] of Object.entries(tagStats)) {
      if (stats.total === 0) continue;

      const currentWeight = 50;
      let suggestedWeight = currentWeight;
      let reason = '';

      const posRatio = stats.pos / stats.total;
      const negRatio = stats.neg / stats.total;

      if (posRatio >= 0.7 && stats.total >= 1) {
        suggestedWeight = Math.min(100, currentWeight + 20);
        reason = `「${role.name}」扮演「${tagName}」标签角色获得高分好评，建议提升标签权重`;
      } else if (negRatio >= 0.6 && stats.total >= 1) {
        suggestedWeight = Math.max(0, currentWeight - 20);
        reason = `「${role.name}」扮演「${tagName}」标签角色反馈较差，建议降低标签权重`;
      }

      if (suggestedWeight !== currentWeight) {
        adjustments.push({
          roleId,
          tagName,
          currentWeight,
          suggestedWeight,
          reason,
        });
      }
    }

    // 最佳体验玩家 → 增强其拿到角色的主要标签
    for (const bestPlayerId of review.bestExperience) {
      const fb = review.perPlayerFeedback.find((f) => f.playerId === bestPlayerId);
      if (fb && fb.roleId === roleId) {
        for (const tag of role.tags.slice(0, 2)) {
          if (!adjustments.some((a) => a.roleId === roleId && a.tagName === tag)) {
            adjustments.push({
              roleId,
              tagName: tag,
              currentWeight: 50,
              suggestedWeight: 70,
              reason: `「${role.name}」为最佳体验玩家分配角色，「${tag}」标签匹配度优秀`,
            });
          }
        }
      }
    }

    // 落差较大玩家 → 减弱其拿到角色的主要标签
    for (const badPlayerId of review.disappointingExperience) {
      const fb = review.perPlayerFeedback.find((f) => f.playerId === badPlayerId);
      if (fb && fb.roleId === roleId) {
        for (const tag of role.tags.slice(0, 2)) {
          if (!adjustments.some((a) => a.roleId === roleId && a.tagName === tag)) {
            adjustments.push({
              roleId,
              tagName: tag,
              currentWeight: 50,
              suggestedWeight: 35,
              reason: `「${role.name}」为落差较大玩家分配角色，「${tag}」标签建议降低匹配权重`,
            });
          }
        }
      }
    }
  }

  // 限制返回 3-8 条，按置信度排序
  adjustments.sort((a, b) => Math.abs(b.suggestedWeight - b.currentWeight) - Math.abs(a.suggestedWeight - a.currentWeight));
  return adjustments.slice(0, Math.max(3, Math.min(8, adjustments.length)));
}

// ============ 辅助函数 ============
export function getHeatColorClass(score: number): string {
  if (score >= 75) return 'heat-high';
  if (score >= 50) return 'heat-mid';
  return 'heat-low';
}

export function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: '新手友好',
    2: '简单',
    3: '中等',
    4: '较难',
    5: '烧脑',
  };
  return labels[level] || '未知';
}

export function getGenderLabel(gender: string): string {
  const labels: Record<string, string> = {
    male: '男',
    female: '女',
    any: '不限',
  };
  return labels[gender] || '未知';
}

export function getGenreBadgeClass(genre: string): string {
  const mapping: Record<string, string> = {
    恐怖: 'badge-rose',
    情感: 'badge-pink',
    硬核: 'badge-indigo',
    欢乐: 'badge-amber',
    阵营: 'badge-emerald',
    本格: 'badge-slate',
    变格: 'badge-purple',
    推理: 'badge-blue',
    机制: 'badge-teal',
    还原: 'badge-cyan',
    沉浸: 'badge-fuchsia',
  };
  return mapping[genre] || 'badge-royal';
}

// ============ 私有工具（外部不导出，仅供内部使用） ============
function getLevelLabel(level: 'newbie' | 'normal' | 'veteran' | 'expert'): string {
  const labels: Record<string, string> = {
    newbie: '新手',
    normal: '普通玩家',
    veteran: '老手',
    expert: '高玩',
  };
  return labels[level] || level;
}
