import axios from 'axios';

const api = axios.create({
  paramsSerializer: {
    indexes: null, // This prevents adding [] to array parameters
  },
});

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const currentPath = window.location.pathname;
//     localStorage.setItem('loginRedirectPath', currentPath);

//     await signOut({
//       redirect: true,
//       callbackUrl: '/signin',
//     });
//     return Promise.reject(error);
//   },
// );

export { api };
