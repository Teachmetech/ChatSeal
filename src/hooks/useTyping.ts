import { useDebouncedCallback } from 'use-debounce';

export const useTyping = (roomId: string) => {
  const start = useDebouncedCallback(() => {
    // For now, just a no-op since we removed typing functionality
  }, 500, { leading: true, trailing: false });

  const stop = useDebouncedCallback(() => {
    // For now, just a no-op since we removed typing functionality
  }, 2000);

  return { onStartTyping: start, onStopTyping: stop };
};
