export interface WifeInfo {
  name: string;
  petName: string;
  age: number;
  birthday: string; // ISO date
  birthstone: string;
  favoriteColor: string;
  yearsTogether: number;
  anniversary: string;
  specialMessage: string;
}

export const wife: WifeInfo = {
  name: 'Mi Amor',
  petName: 'my love',
  age: 30,
  birthday: '1996-07-15',
  birthstone: 'Ruby',
  favoriteColor: 'Wine red',
  yearsTogether: 8,
  anniversary: '2017-03-20',
  specialMessage:
    'You are the diamond in my life — brilliant, rare, and the most beautiful thing I have ever found.',
};
