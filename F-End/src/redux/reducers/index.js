import { combineReducers, createStore } from "redux";
import authReducer from './authReducer'; 

// import other reducers
const rootReducer = combineReducers({
    // Key Value map of reducers
    authUser: authReducer
});

//Store
export const store = createStore(rootReducer);

   



export default rootReducer;
