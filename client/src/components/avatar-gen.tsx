import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Generate a consistent gradient background based on a string (like email)
function stringToGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c1 = `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
  const c2 = `hsl(${(Math.abs(hash) + 40) % 360}, 80%, 70%)`;
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

export function AvatarGen({ 
  email = "admin@electro.com", 
  imageUrl, 
  className = "" 
}: { 
  email?: string, 
  imageUrl?: string | null,
  className?: string
}) {
  const firstLetter = email.charAt(0).toUpperCase();
  const bg = stringToGradient(email);

  return (
    <Avatar className={`border-2 border-background shadow-sm hover-lift ${className}`}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={email} className="object-cover" />
      ) : (
        <AvatarFallback 
          style={{ background: bg }} 
          className="text-white font-bold font-display"
        >
          {firstLetter}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
