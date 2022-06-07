import isPromise from 'is-promise';
import { isFSA } from 'flux-standard-action';

export default function promiseMiddleware({ dispatch }) {
  return next => action => {
    if(!isFSA(action)) {
      return isPromise(action) ? action.then(dispatch) : next(action);
    }

    return isPromise(action.payload)
      ? action.payload
        .then(result => dispatch({ ...action, payload: result }))
        .catch(error => {
          dispatch({ ...action, payload: error, error: true });

          const jqueryMajorVersion = window.jQuery?.fn?.jquery.split('.');
          //jQuery 3 Defered objects are A+ complinent previous versions did not handle throw properly.
          if(jqueryMajorVersion !== undefined && jqueryMajorVersion < 3)
            return Promise.reject(error);

          throw error;
        })
      : next(action);
  };
}
