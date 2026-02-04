export interface User {
  id: number;
  telegramId: bigint;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  createdAt: string;
  bonusAccount?: BonusAccount;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  categoryId: number;
  category?: ServiceCategory;
  isActive: boolean;
  order: number;
}

export interface ServiceCategory {
  id: number;
  name: string;
  order: number;
  services?: Service[];
}

export interface Booking {
  id: number;
  userId: number;
  serviceId: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  user?: User;
  service?: Service;
  review?: Review;
}

export interface WorkExample {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  order: number;
}

export interface Review {
  id: number;
  userId: number;
  bookingId: number;
  rating: number;
  comment?: string;
  photos?: string[];
  createdAt: string;
  user?: {
    firstName: string;
    lastName?: string;
  };
}

export interface BonusAccount {
  id: number;
  userId: number;
  balance: number;
  totalEarned: number;
  transactions?: BonusTransaction[];
}

export interface BonusTransaction {
  id: number;
  accountId: number;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'BONUS';
  reason?: string;
  createdAt: string;
  booking?: Booking;
}
