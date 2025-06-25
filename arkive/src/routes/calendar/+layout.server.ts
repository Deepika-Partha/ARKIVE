import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const token = cookies.get('token');
  if (!token) {
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
  return {};
};