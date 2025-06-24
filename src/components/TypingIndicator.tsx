import React from 'react';

interface TypingIndicatorProps {
  typingUsers: { name: string }[];
  currentUser: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, currentUser }) => {
  const otherTypingUsers = typingUsers.filter(u => u.name !== currentUser);

  if (otherTypingUsers.length === 0) {
    return <div className="h-6 px-4" />;
  }

  const names = otherTypingUsers.map(u => u.name).join(', ');
  const verb = otherTypingUsers.length > 1 ? 'are' : 'is';

  return (
    <div className="h-6 px-4 text-sm text-gray-400 italic">
      {names} {verb} typing...
    </div>
  );
};

export default TypingIndicator;
