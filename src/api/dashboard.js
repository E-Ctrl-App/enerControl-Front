import {apiRequest} from './client';

export async function getDashboard() {
  const [summary, classrooms, devices, activity] = await Promise.all([
    apiRequest('/dashboard/summary'),
    apiRequest('/dashboard/classrooms'),
    apiRequest('/dashboard/devices'),
    apiRequest('/dashboard/activity'),
  ]);

  return {summary, classrooms, devices, activity};
}

