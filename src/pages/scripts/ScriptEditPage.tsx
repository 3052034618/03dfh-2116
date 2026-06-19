import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  BookOpen,
  UsersRound,
  GitBranch,
  Plus,
  Upload,
  Pencil,
  Trash2,
  X,
  Save,
  ArrowLeft,
  Tag,
} from 'lucide-react';
import { useScriptStore } from '@/stores/scriptStore';
import StarRating from '@/components/ui/StarRating';
import DifficultyStars from '@/components/ui/DifficultyStars';
import RadarChartSmall from '@/components/ui/RadarChartSmall';
import RoleAvatar from '@/components/ui/RoleAvatar';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  getGenreBadgeClass,
  getGenderLabel,
} from '@/utils/assignmentEngine';
import type { Script, Role, RoleRelation } from '@/types';

const GENRE_OPTIONS = [
  '情感',
  '硬核',
  '欢乐',
  '恐怖',
  '阵营',
  '本格',
  '变格',
  '还原',
  '机制',
  '古风',
  '现代',
  '民国',
  '科幻',
  '校园',
];

const RELATION_TYPE_META: Record<
  RoleRelation['type'],
  { label: string; icon: string; color: string }
> = {
  lover: { label: '恋人', icon: '❤️', color: 'badge-crimson' },
  enemy: { label: '敌对', icon: '⚔️', color: 'badge-crimson' },
  family: { label: '家人', icon: '👪', color: 'badge-amber' },
  partner: { label: '伙伴', icon: '🤝', color: 'badge-mint' },
  secret: { label: '秘密', icon: '🤫', color: 'badge-royal' },
};

type TabKey = 'basic' | 'roles' | 'relations';

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <span
        className={cn(
          'relative w-10 h-5 rounded-full transition-all duration-300 shrink-0',
          checked
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_10px_rgba(212,168,75,0.4)]'
            : 'bg-ink-600'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300',
            checked ? 'left-[22px]' : 'left-0.5'
          )}
        />
      </span>
      <span
        className={cn(
          'text-xs transition-colors duration-200',
          checked ? 'text-amber-300' : 'text-slate-500 group-hover:text-slate-400'
        )}
      >
        {label}
      </span>
    </button>
  );
}

function RoleCard({
  role,
  minPlayerCount,
  onClick,
  onDelete,
}: {
  role: Role;
  minPlayerCount: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  const canDelete = true;
  const radarData = {
    difficulty: role.difficulty * 2,
    emotion: role.emotionLevel * 2,
    deduction: role.deductionLevel * 2,
    beginner: role.beginnerFriendly ? 9 : 3,
    social: role.hostType ? 9 : 4,
  };

  const genderBadgeClass =
    role.gender === 'male'
      ? 'badge-royal'
      : role.gender === 'female'
      ? 'badge-pink badge-crimson'
      : 'badge-mint';

  return (
    <div
      className={cn(
        'card-dark grain-overlay p-5 cursor-pointer transition-all duration-300 group relative',
        'hover:border-amber-500/40 hover:shadow-glow'
      )}
      onClick={onClick}
    >
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-crimson-400 hover:bg-crimson-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          title="删除角色"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0">
          <RoleAvatar
            name={role.name}
            avatar={role.avatar}
            gender={role.gender}
            size="lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn('badge text-[10px]', genderBadgeClass)}>
                {getGenderLabel(role.gender)}
              </span>
              <DifficultyStars level={role.difficulty} />
            </div>
          </div>
          <h4 className="font-serif text-lg text-gradient-gold flex items-center gap-2">
            {role.name}
            <Pencil className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
          </h4>
        </div>
      </div>

      <div className="flex items-center justify-center mb-4">
        <RadarChartSmall data={radarData} size={130} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <ToggleSwitch
            checked={role.beginnerFriendly}
            onChange={() => {}}
            label="新手友好"
          />
          <ToggleSwitch
            checked={role.hostType}
            onChange={() => {}}
            label="主持型/信息位"
          />
        </div>

        {role.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {role.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] bg-ink-700/70 text-slate-400 border border-ink-500/40"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-ink-700/40">
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {role.description}
        </p>
      </div>
    </div>
  );
}

function RoleEditModal({
  open,
  onClose,
  onSave,
  initialRole,
  scriptId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  initialRole?: Role;
  scriptId: string;
}) {
  const [form, setForm] = useState<Role>({
    id: initialRole?.id ?? `role-${Date.now()}`,
    scriptId,
    name: initialRole?.name ?? '',
    avatar: initialRole?.avatar ?? '',
    gender: initialRole?.gender ?? 'any',
    difficulty: initialRole?.difficulty ?? 3,
    emotionLevel: initialRole?.emotionLevel ?? 3,
    deductionLevel: initialRole?.deductionLevel ?? 3,
    beginnerFriendly: initialRole?.beginnerFriendly ?? false,
    hostType: initialRole?.hostType ?? false,
    tags: initialRole?.tags ?? [],
    description: initialRole?.description ?? '',
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        id: initialRole?.id ?? `role-${Date.now()}`,
        scriptId,
        name: initialRole?.name ?? '',
        avatar: initialRole?.avatar ?? '',
        gender: initialRole?.gender ?? 'any',
        difficulty: initialRole?.difficulty ?? 3,
        emotionLevel: initialRole?.emotionLevel ?? 3,
        deductionLevel: initialRole?.deductionLevel ?? 3,
        beginnerFriendly: initialRole?.beginnerFriendly ?? false,
        hostType: initialRole?.hostType ?? false,
        tags: initialRole?.tags ?? [],
        description: initialRole?.description ?? '',
      });
      setTagInput('');
    }
  }, [open, initialRole, scriptId]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((f) => ({ ...f, tags: [...f.tags, trimmed] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const radarData = {
    difficulty: form.difficulty * 2,
    emotion: form.emotionLevel * 2,
    deduction: form.deductionLevel * 2,
    beginner: form.beginnerFriendly ? 9 : 3,
    social: form.hostType ? 9 : 4,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialRole ? '编辑角色' : '添加角色'}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            取消
          </button>
          <button
            onClick={() => form.name.trim() && onSave(form)}
            disabled={!form.name.trim()}
            className={cn(
              'btn-gold flex items-center gap-2',
              !form.name.trim() && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="text-xs text-slate-500 mb-2 font-medium">
              角色头像
            </div>
            <div className="flex flex-col items-center gap-3 p-5 bg-ink-900/40 rounded-xl border border-ink-600/30">
              <RoleAvatar
                name={form.name || '?'}
                avatar={form.avatar}
                gender={form.gender}
                size="xl"
              />
              <div className="w-full space-y-2">
                <input
                  type="text"
                  placeholder="头像图片URL"
                  value={form.avatar}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, avatar: e.target.value }))
                  }
                  className="input-dark text-xs"
                />
                <button className="w-full btn-ghost text-xs flex items-center justify-center gap-1.5 py-2">
                  <Upload className="w-3.5 h-3.5" />
                  本地上传
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-2 font-medium text-center">
              五维属性预览
            </div>
            <div className="flex justify-center p-4 bg-ink-900/40 rounded-xl border border-ink-600/30">
              <RadarChartSmall data={radarData} size={180} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                角色名称 <span className="text-crimson-400">*</span>
              </div>
              <input
                type="text"
                placeholder="请输入角色名称"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="input-dark"
              />
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                性别
              </div>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    gender: e.target.value as Role['gender'],
                  }))
                }
                className="input-dark"
              >
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="any">不限</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                角色难度
              </div>
              <div className="h-[42px] flex items-center px-3 rounded-lg bg-ink-900/60 border border-ink-500/50">
                <StarRating
                  value={form.difficulty}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      difficulty: v as Role['difficulty'],
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                情感浓度
              </div>
              <div className="h-[42px] flex items-center px-3 rounded-lg bg-ink-900/60 border border-ink-500/50">
                <StarRating
                  value={form.emotionLevel}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      emotionLevel: v as Role['emotionLevel'],
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1.5 font-medium">
                推理参与度
              </div>
              <div className="h-[42px] flex items-center px-3 rounded-lg bg-ink-900/60 border border-ink-500/50">
                <StarRating
                  value={form.deductionLevel}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      deductionLevel: v as Role['deductionLevel'],
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-ink-900/40 border border-ink-600/30">
              <ToggleSwitch
                checked={form.beginnerFriendly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, beginnerFriendly: v }))
                }
                label="新手友好"
              />
              <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed">
                适合第一次玩的新手玩家
              </p>
            </div>
            <div className="p-4 rounded-xl bg-ink-900/40 border border-ink-600/30">
              <ToggleSwitch
                checked={form.hostType}
                onChange={(v) => setForm((f) => ({ ...f, hostType: v }))}
                label="主持型 / 信息位"
              />
              <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed">
                需要主动带动节奏或掌握关键信息
              </p>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1.5 font-medium">
              自定义标签
            </div>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-ink-900/40 border border-ink-600/30 min-h-[52px]">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-crimson-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                <input
                  type="text"
                  placeholder="输入标签后回车添加"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                />
                {tagInput.trim() && (
                  <button
                    onClick={addTag}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                  >
                    添加
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1.5 font-medium">
              角色简介
            </div>
            <textarea
              rows={5}
              placeholder="简要描述角色背景、性格、关键剧情等..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="input-dark resize-none"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AddRelationModal({
  open,
  onClose,
  onSave,
  roles,
  existingRelations,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (rel: RoleRelation) => void;
  roles: Role[];
  existingRelations: RoleRelation[];
}) {
  const [roleA, setRoleA] = useState('');
  const [roleB, setRoleB] = useState('');
  const [type, setType] = useState<RoleRelation['type']>('lover');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);

  useEffect(() => {
    if (open) {
      setRoleA(roles[0]?.id ?? '');
      setRoleB(roles[1]?.id ?? '');
      setType('lover');
      setIntensity(2);
    }
  }, [open, roles]);

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));
  const availableRoleB = roleOptions.filter((r) => r.value !== roleA);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="添加角色关系"
      size="md"
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            取消
          </button>
          <button
            onClick={() => {
              if (roleA && roleB && roleA !== roleB) {
                onSave({ roleA, roleB, type, intensity });
              }
            }}
            disabled={!roleA || !roleB || roleA === roleB}
            className={cn(
              'btn-gold flex items-center gap-2',
              (!roleA || !roleB || roleA === roleB) &&
                'opacity-50 cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
            添加关系
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1.5 font-medium">
              角色 A
            </div>
            <select
              value={roleA}
              onChange={(e) => setRoleA(e.target.value)}
              className="input-dark"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1.5 font-medium">
              角色 B
            </div>
            <select
              value={roleB}
              onChange={(e) => setRoleB(e.target.value)}
              className="input-dark"
            >
              {availableRoleB.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-2 font-medium">
            关系类型
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(
              Object.entries(RELATION_TYPE_META) as [
                RoleRelation['type'],
                typeof RELATION_TYPE_META[RoleRelation['type']]
              ][]
            ).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setType(key)}
                className={cn(
                  'p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1.5',
                  type === key
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-glow'
                    : 'bg-ink-900/40 border-ink-600/30 hover:border-ink-500/50'
                )}
              >
                <span className="text-xl">{meta.icon}</span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    type === key ? 'text-amber-300' : 'text-slate-400'
                  )}
                >
                  {meta.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-500 font-medium">
              关系强度
            </div>
            <div className="text-xs">
              <span className="text-amber-400 font-medium">{intensity}</span>
              <span className="text-slate-600"> / 3</span>
              <span className="text-slate-500 ml-2">
                {intensity === 1
                  ? '（微弱）'
                  : intensity === 2
                  ? '（普通）'
                  : '（强烈）'}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={intensity}
            onChange={(e) =>
              setIntensity(Number(e.target.value) as 1 | 2 | 3)
            }
            className="w-full h-2 bg-ink-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-600">
            <span>弱</span>
            <span>中</span>
            <span>强</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function ScriptEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getScriptById,
    updateRole: storeUpdateRole,
    addRole: storeAddRole,
    removeRole: storeRemoveRole,
  } = useScriptStore();

  const [script, setScript] = useState<Script | undefined>(() =>
    id ? getScriptById(id) : undefined
  );
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [localScript, setLocalScript] = useState<Script | undefined>(script);

  useEffect(() => {
    if (id) {
      const s = getScriptById(id);
      setScript(s);
      setLocalScript(s);
    }
  }, [id, getScriptById]);

  const workingScript = localScript ?? script;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'basic', label: '基本信息', icon: <BookOpen className="w-4 h-4" /> },
    {
      key: 'roles',
      label: '角色管理',
      icon: <UsersRound className="w-4 h-4" />,
    },
    {
      key: 'relations',
      label: '角色关系',
      icon: <GitBranch className="w-4 h-4" />,
    },
  ];

  if (!workingScript) {
    return (
      <div className="p-6">
        <div className="card-dark grain-overlay p-16 text-center">
          <div className="text-slate-500 mb-2">剧本不存在</div>
          <button
            onClick={() => navigate('/scripts')}
            className="btn-ghost mt-4"
          >
            返回剧本列表
          </button>
        </div>
      </div>
    );
  }

  const handleSaveBasic = () => {
    if (localScript) {
      setScript(localScript);
    }
  };

  const handleSaveRole = (role: Role) => {
    const exists = workingScript.roles.some((r) => r.id === role.id);
    if (exists) {
      storeUpdateRole(workingScript.id, role.id, role);
      setLocalScript((s) =>
        s
          ? {
              ...s,
              roles: s.roles.map((r) => (r.id === role.id ? role : r)),
            }
          : s
      );
    } else {
      storeAddRole(workingScript.id, role);
      setLocalScript((s) =>
        s ? { ...s, roles: [...s.roles, role] } : s
      );
    }
    setRoleModalOpen(false);
    setEditingRole(undefined);
  };

  const handleDeleteRole = (roleId: string) => {
    if (workingScript.roles.length <= 2) return;
    if (confirm('确定删除该角色吗？相关关系也会一并删除。')) {
      storeRemoveRole(workingScript.id, roleId);
      setLocalScript((s) =>
        s
          ? {
              ...s,
              roles: s.roles.filter((r) => r.id !== roleId),
              relations: s.relations.filter(
                (rel) => rel.roleA !== roleId && rel.roleB !== roleId
              ),
            }
          : s
      );
    }
  };

  const handleAddRelation = (rel: RoleRelation) => {
    setLocalScript((s) =>
      s ? { ...s, relations: [...s.relations, rel] } : s
    );
    setRelationModalOpen(false);
  };

  const handleRemoveRelation = (index: number) => {
    setLocalScript((s) =>
      s
        ? {
            ...s,
            relations: s.relations.filter((_, i) => i !== index),
          }
        : s
    );
  };

  const getRoleName = (roleId: string) =>
    workingScript.roles.find((r) => r.id === roleId)?.name ?? '未知角色';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 text-sm">
        <Link
          to="/scripts"
          className="flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          剧本库
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-amber-300 font-medium truncate max-w-md">
          {workingScript.name}
        </span>
      </div>

      <div className="card-dark grain-overlay overflow-hidden">
        <div className="flex items-center gap-1 px-2 pt-2 border-b border-ink-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-t-lg text-sm font-medium transition-all duration-200 relative',
                activeTab === tab.key
                  ? 'text-amber-400 bg-ink-900/60'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-ink-800/40'
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'basic' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="text-xs text-slate-500 mb-3 font-medium">
                  封面图
                </div>
                <div className="space-y-4">
                  <div
                    className="relative overflow-hidden rounded-xl border border-ink-600/40 bg-ink-900/40"
                    style={{ aspectRatio: '16/10' }}
                  >
                    {localScript?.cover ? (
                      <img
                        src={localScript.cover}
                        alt="封面"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        暂无封面
                      </div>
                    )}
                    <div className="absolute inset-0 bg-ink-950/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="btn-gold text-xs cursor-pointer">
                        <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                        更换封面
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="封面图片URL"
                    value={localScript?.cover ?? ''}
                    onChange={(e) =>
                      setLocalScript((s) =>
                        s ? { ...s, cover: e.target.value } : s
                      )
                    }
                    className="input-dark text-xs"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-5">
                <div>
                  <div className="text-xs text-slate-500 mb-1.5 font-medium">
                    剧本名称 <span className="text-crimson-400">*</span>
                  </div>
                  <input
                    type="text"
                    placeholder="请输入剧本名称"
                    value={localScript?.name ?? ''}
                    onChange={(e) =>
                      setLocalScript((s) =>
                        s ? { ...s, name: e.target.value } : s
                      )
                    }
                    className="input-dark font-serif text-lg"
                  />
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    题材标签
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-ink-900/40 border border-ink-600/30">
                    {GENRE_OPTIONS.map((genre) => {
                      const selected = localScript?.genre.includes(genre);
                      return (
                        <span
                          key={genre}
                          onClick={() =>
                            setLocalScript((s) => {
                              if (!s) return s;
                              const g = s.genre.includes(genre)
                                ? s.genre.filter((x) => x !== genre)
                                : [...s.genre, genre];
                              return { ...s, genre: g };
                            })
                          }
                          className={cn(
                            'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border',
                            selected
                              ? cn(
                                  getGenreBadgeClass(genre),
                                  'ring-2 ring-amber-400/40 scale-105'
                                )
                              : 'bg-ink-800/60 text-slate-500 border-ink-600/40 hover:border-amber-500/40 hover:text-slate-300'
                          )}
                        >
                          {genre}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1.5 font-medium">
                      玩家人数
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={2}
                        max={12}
                        value={localScript?.playerCount ?? 6}
                        onChange={(e) =>
                          setLocalScript((s) =>
                            s
                              ? {
                                  ...s,
                                  playerCount: Math.max(
                                    2,
                                    Math.min(12, Number(e.target.value) || 2)
                                  ),
                                }
                              : s
                          )
                        }
                        className="input-dark pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                        人
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1.5 font-medium">
                      时长（分钟）
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={60}
                        step={30}
                        value={localScript?.duration ?? 240}
                        onChange={(e) =>
                          setLocalScript((s) =>
                            s
                              ? {
                                  ...s,
                                  duration: Math.max(
                                    60,
                                    Number(e.target.value) || 60
                                  ),
                                }
                              : s
                          )
                        }
                        className="input-dark pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                        min
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1.5 font-medium">
                      整体难度
                    </div>
                    <div className="h-[42px] flex items-center px-3 rounded-lg bg-ink-900/60 border border-ink-500/50">
                      <StarRating
                        value={localScript?.difficulty ?? 3}
                        onChange={(v) =>
                          setLocalScript((s) =>
                            s
                              ? {
                                  ...s,
                                  difficulty: v as Script['difficulty'],
                                }
                              : s
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1.5 font-medium">
                    剧本简介
                  </div>
                  <textarea
                    rows={6}
                    placeholder="请输入剧本的背景故事、核心设定、主题立意等..."
                    value={localScript?.description ?? ''}
                    onChange={(e) =>
                      setLocalScript((s) =>
                        s ? { ...s, description: e.target.value } : s
                      )
                    }
                    className="input-dark resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="divider-gold my-6" />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => navigate('/scripts')}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleSaveBasic}
                disabled={!localScript?.name.trim()}
                className={cn(
                  'btn-gold flex items-center gap-2',
                  !localScript?.name.trim() && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Save className="w-4 h-4" />
                保存基本信息
              </button>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="title-gold text-lg mb-1">角色管理</h2>
                <p className="text-xs text-slate-500">
                  当前共 <span className="text-amber-400">{workingScript.roles.length}</span> 个角色
                  {workingScript.playerCount && (
                    <span className="text-slate-600 ml-2">
                      · 剧本人数：{workingScript.playerCount}人
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingRole(undefined);
                  setRoleModalOpen(true);
                }}
                className="btn-gold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加角色
              </button>
            </div>

            {workingScript.roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {workingScript.roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    minPlayerCount={workingScript.playerCount}
                    onClick={() => {
                      setEditingRole(role);
                      setRoleModalOpen(true);
                    }}
                    onDelete={() => handleDeleteRole(role.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="card-dark grain-overlay p-16 text-center">
                <div className="text-slate-500 mb-2">暂无角色</div>
                <div className="text-xs text-slate-600 mb-4">
                  点击右上角「添加角色」开始创建
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'relations' && (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="title-gold text-lg mb-1">角色关系</h2>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  配置角色间关系用于智能分角冲突检测。例如：<br />
                  · 情侣玩家分到「恋人」关系角色可获得加分<br />
                  · 情侣玩家分到「敌对」强关系角色会触发高警告<br />
                  · 熟人分到「家人/伙伴」关系可增加匹配度
                </p>
              </div>
              <button
                onClick={() => setRelationModalOpen(true)}
                disabled={workingScript.roles.length < 2}
                className={cn(
                  'btn-gold flex items-center gap-2 shrink-0',
                  workingScript.roles.length < 2 &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4" />
                添加关系
              </button>
            </div>

            {workingScript.relations.length > 0 ? (
              <div className="space-y-3">
                {workingScript.relations.map((rel, index) => {
                  const meta = RELATION_TYPE_META[rel.type];
                  return (
                    <div
                      key={`${rel.roleA}-${rel.roleB}-${index}`}
                      className="card-dark grain-overlay p-4 flex items-center gap-4 group"
                    >
                      <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <RoleAvatar
                            name={getRoleName(rel.roleA)}
                            avatar={
                              workingScript.roles.find(
                                (r) => r.id === rel.roleA
                              )?.avatar
                            }
                            gender={
                              workingScript.roles.find(
                                (r) => r.id === rel.roleA
                              )?.gender
                            }
                            size="sm"
                          />
                          <span className="font-medium text-slate-200 truncate max-w-[120px]">
                            {getRoleName(rel.roleA)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={
                              meta.color.includes('crimson')
                                ? 'crimson'
                                : meta.color.includes('amber')
                                ? 'amber'
                                : meta.color.includes('mint')
                                ? 'mint'
                                : 'royal'
                            }
                            className="px-3 py-1"
                          >
                            <span className="mr-1">{meta.icon}</span>
                            {meta.label}
                          </Badge>

                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900/60 border border-ink-600/40">
                            {Array.from({ length: 3 }, (_, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'w-2 h-2 rounded-full transition-all',
                                  i < rel.intensity
                                    ? 'bg-amber-400 shadow-[0_0_6px_rgba(212,168,75,0.6)]'
                                    : 'bg-ink-600'
                                )}
                              />
                            ))}
                            <span className="text-[10px] text-slate-500 ml-1">
                              强度{rel.intensity}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />

                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-medium text-slate-200 truncate max-w-[120px] text-right">
                            {getRoleName(rel.roleB)}
                          </span>
                          <RoleAvatar
                            name={getRoleName(rel.roleB)}
                            avatar={
                              workingScript.roles.find(
                                (r) => r.id === rel.roleB
                              )?.avatar
                            }
                            gender={
                              workingScript.roles.find(
                                (r) => r.id === rel.roleB
                              )?.gender
                            }
                            size="sm"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveRelation(index)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-crimson-400 hover:bg-crimson-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card-dark grain-overlay p-16 text-center">
                <div className="text-slate-500 mb-2">暂无角色关系</div>
                <div className="text-xs text-slate-600 mb-4">
                  添加关系可提升智能分角的匹配精度
                </div>
                {workingScript.roles.length < 2 && (
                  <div className="text-xs text-crimson-400/80">
                    需要至少 2 个角色才能配置关系
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <RoleEditModal
        open={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setEditingRole(undefined);
        }}
        onSave={handleSaveRole}
        initialRole={editingRole}
        scriptId={workingScript.id}
      />

      <AddRelationModal
        open={relationModalOpen}
        onClose={() => setRelationModalOpen(false)}
        onSave={handleAddRelation}
        roles={workingScript.roles}
        existingRelations={workingScript.relations}
      />
    </div>
  );
}
