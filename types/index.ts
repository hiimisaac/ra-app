export interface NewsItemType {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
}

export interface ImpactStoryType {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
  featured: boolean;
}

export interface EventType {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  category: string;
  attendees?: number;
  isRSVPed: boolean;
}

export interface VolunteerOpportunityType {
  id: string;
  title: string;
  organization: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  spotsAvailable: number;
  isSignedUp: boolean;
}

export interface UserActivityType {
  id: string;
  type: 'volunteer' | 'event' | 'donation';
  title: string;
  date: string;
  location?: string;
  hours?: number;
}

export interface UserDataType {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  volunteerHours: number;
  eventsAttended: number;
  donationsMade: number;
}