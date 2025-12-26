import { Star } from 'lucide-react';
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  codeId: number;
  isFavorite?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FavoriteButton({ 
  codeId, 
  isFavorite = false, 
  size = 'md',
  showLabel = false 
}: FavoriteButtonProps) {
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await axios.delete(`/api/v1/users/favorites/${codeId}`);
        return false;
      } else {
        await axios.post(`/api/v1/users/favorites/${codeId}`);
        return true;
      }
    },
    onSuccess: (newState) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['diagnosticCodes'] });
      toast.success(newState ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update favorites');
    },
  });

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      variant={isFavorite ? 'default' : 'ghost'}
      size="icon"
      className={cn(
        sizeClasses[size],
        isFavorite && 'bg-yellow-500 hover:bg-yellow-600 text-white'
      )}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite.mutate();
      }}
      disabled={toggleFavorite.isPending}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star 
        className={cn(
          iconSizes[size],
          isFavorite && 'fill-current'
        )} 
      />
      {showLabel && (
        <span className="ml-2">
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </Button>
  );
}
