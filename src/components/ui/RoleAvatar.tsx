import { cn } from '@/lib/utils';

type Gender = 'male' | 'female' | 'any';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface RoleAvatarProps {
  name: string;
  avatar?: string;
  gender?: Gender;
  size?: Size;
}

const sizeMap: Record<Size, { wrapper: string; text: string }> = {
  sm: { wrapper: 'w-10 h-10', text: 'text-sm' },
  md: { wrapper: 'w-14 h-14', text: 'text-lg' },
  lg: { wrapper: 'w-20 h-20', text: 'text-2xl' },
  xl: { wrapper: 'w-28 h-28', text: 'text-3xl' },
};

const genderBackgrounds: Record<Gender, string> = {
  male: 'linear-gradient(135deg, #3B5998 0%, #4B2E7A 100%)',
  female: 'linear-gradient(135deg, #C93A4E 0%, #8B3A62 100%)',
  any: 'linear-gradient(135deg, #553C9A 0%, #4CB86E 100%)',
};

export default function RoleAvatar({
  name,
  avatar,
  gender = 'any',
  size = 'md',
}: RoleAvatarProps) {
  const sizes = sizeMap[size];
  const firstChar = name?.charAt(0) || '?';

  return (
    <div className={cn('relative shrink-0', sizes.wrapper)}>
      <div
        className={cn('hexagon w-full h-full flex items-center justify-center overflow-hidden', sizes.text)}
        style={{
          background: avatar ? undefined : genderBackgrounds[gender],
          border: '2px solid rgba(212, 168, 75, 0.6)',
          boxShadow: '0 0 12px rgba(212, 168, 75, 0.25), inset 0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover hexagon"
          />
        ) : (
          <span className="font-serif font-bold text-white drop-shadow-lg">
            {firstChar}
          </span>
        )}
      </div>
    </div>
  );
}
