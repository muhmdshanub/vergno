import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx'
import './index.css'
import store from './store.js';
import ThemeProviderComponent from './components/HOC/ThemeProviderComponent.jsx';
import SwitchRootRoute from './components/HOC/SwitchRootRoute.jsx';
import SwitchAdminRootRoute from './components/HOC/admin/SwitchAdminRootRoute.jsx'
import PeoplesScreen from './screens/PeoplesScreen.jsx';
import PrivateRoute from './components/HOC/PrivateRoute.jsx';
import NotificationsScreen from './screens/NotificationsScreen.jsx';
import TestScreen from './screens/TestScreen.jsx'
import UserSocketProvider from './components/HOC/socket_io/UserSocketProvider.jsx';
import PrivateRouteAdmin from './components/HOC/admin/PrivateRouteAdmin.jsx';
import UserManagement from './screens/admin/UserManagement.jsx';
import QueryManagement from './screens/admin/QueryManagement.jsx';
import SingleQueryScreen from './screens/admin/SingleQueryScreen.jsx';
import SinglePerspectiveScreen from './screens/admin/SinglePerspectiveScreen.jsx';
import PerspectiveManagement from './screens/admin/PerspectiveManagement.jsx';
import CommentManagementScreen from './screens/admin/CommentManagement.jsx';
import AnswerManagementScreen from './screens/admin/AnswerManagementScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import StyledErrorBoundary from './components/HOC/ErrorBoundary.jsx';
import NotFound from './screens/NotFound.jsx';
import OtherProfileScreen from './screens/OtherProfileScreen .jsx';
import TopicsManagementScreen from './screens/admin/TopicManagement.jsx';
import TopicsScreen from './screens/TopicsScreen.jsx';
import TopicProfileScreen from './screens/TopicProfileScreen.jsx';
import ChatScreen from './screens/ChatScreen.jsx';
import DiscoverScreen from './screens/DiscoverScreen.jsx';
// Create the router
const router = createBrowserRouter(
  createRoutesFromElements(
    
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<SwitchRootRoute />} />
      {/* Add more routes here as needed */}
      <Route path='/test' element={<TestScreen />} />
      <Route path='' element={<PrivateRoute />}>
          
              
              <Route path='/peoples' element={<PeoplesScreen />} />
              <Route path='/topics' element={<TopicsScreen />} />
              <Route path='/topics/:topicId/*' element={<TopicProfileScreen />} />
              <Route path='/notifications' element={<NotificationsScreen />} />
              <Route path='/profile/*' element={<ProfileScreen />} />
              <Route path='/profiles/:userId/*' element={<OtherProfileScreen />} />
              <Route path='/chats' element={<ChatScreen />} />
              <Route path='/discovery' element={<DiscoverScreen />} />
              
            
        
      </Route>
      {/* /admin routes */}
      <Route  path="/admin" element={<SwitchAdminRootRoute />} />

      <Route path='' element={<PrivateRouteAdmin />}>
          <Route path='/admin/user-management' element={<UserManagement />} />
          <Route path='/admin/query-management' element={<QueryManagement />} />
          <Route path="/admin/query-management/:queryId" element={<SingleQueryScreen />} />
          <Route path='/admin/perspective-management' element={<PerspectiveManagement />} />
          <Route path="/admin/perspective-management/:perspectiveId" element={<SinglePerspectiveScreen />} />
          <Route path='/admin/comment-management' element={<CommentManagementScreen />} />
          <Route path='/admin/answer-management' element={<AnswerManagementScreen />} />
          <Route path='/admin/topics-management' element={<TopicsManagementScreen />} />
      </Route>

      {/* Fallback route for 404 */}
      <Route path='*' element={<NotFound />} />
    </Route>


  )
);

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(
    <StyledErrorBoundary>
      <Provider store={store}>
        <React.StrictMode>
          <ThemeProviderComponent>
            <RouterProvider router={router} />
          </ThemeProviderComponent>
        </React.StrictMode>
      </Provider>
    </StyledErrorBoundary>
);
