export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Link {
  id: string;
  userId: string;
  name: string;
  description: string;
  originalUrl: string;
  thumbnailUrl?: string;
  password?: string;
  showPassword: boolean;
  token: string;
  views: number;
  createdAt: string;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "signup";
}

export interface Profile {
  id: string;
  username: string;
  updatedAt: string;
}