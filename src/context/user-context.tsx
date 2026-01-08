
'use client';

import { createContext } from 'react';
import type { User } from '@/lib/users';

export const UserContext = createContext<User | null>(null);
