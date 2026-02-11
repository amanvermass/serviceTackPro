
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  joinDate: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  contact: {
    phone: string;
    linkedin?: string;
    github?: string;
  };
  stats: {
    projectsCompleted: number;
    activeTickets: number;
    hoursLogged: number;
  };
}

export const CURRENT_USER: UserProfile = {
  id: 'u-101',
  name: 'Alex Morgan',
  email: 'alex.morgan@service-track.pro',
  role: 'Senior System Administrator',
  department: 'Infrastructure & DevOps',
  location: 'New York, USA',
  joinDate: '2022-03-15',
  avatarUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_108ec1117-1763301720568.png',
  bio: 'Passionate about cloud infrastructure, automation, and system reliability. Experienced in AWS, Kubernetes, and Terraform. Always looking to optimize workflows and enhance system security.',
  skills: ['AWS', 'Kubernetes', 'Terraform', 'Python', 'Node.js', 'CI/CD', 'Security'],
  contact: {
    phone: '+1 (555) 123-4567',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan-dev'
  },
  stats: {
    projectsCompleted: 42,
    activeTickets: 5,
    hoursLogged: 1250
  }
};
