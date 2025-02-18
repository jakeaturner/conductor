//
// LibreTexts Conductor
// userReducer.js
//

/* Utils */
import Cookies from 'js-cookie';

/* User */
const userInitialState = {
  uuid: '',
  authType: '',
  firstName: '',
  lastName: '',
  avatar: '/favicon-96x96.png',
  roles: [],
  isAuthenticated: false,
  isCampusAdmin: false,
  isSuperAdmin: false,
  isVerifiedInstructor: false,
};

export default function userReducer(state = userInitialState, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: true
      }
    case 'CHECK_AUTH':
      if (Cookies.get('conductor_access') !== undefined) {
        return {
          ...state,
          isAuthenticated: true
        }
      } else {
        return state;
      }
    case 'CLEAR_AUTH':
      return {
        ...state,
        isAuthenticated: false
      }
    case 'SET_USER_NAME':
      return {
        ...state,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName
      }
    case 'SET_USER_INFO':
      return {
        ...state,
        uuid: action.payload.uuid,
        authType: action.payload.authType,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        roles: action.payload.roles,
        avatar: action.payload.avatar,
        isCampusAdmin: action.payload.isCampusAdmin,
        isSuperAdmin: action.payload.isSuperAdmin,
        isVerifiedInstructor: action.payload.isVerifiedInstructor,
      }
    case 'CLEAR_USER_INFO':
      return userInitialState;
    default:
      return state;
  }
};
