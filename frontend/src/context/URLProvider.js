import React from 'react';
import URLContext from './URLContext';

const URLProvider = ({ children }) => {
  const urls = {
    DataManager: 'http://localhost:3000',
    ModelTrainer: 'http://localhost:3001',
    Predictors: 'http://localhost:3002',
    Users:'http://localhost:3004'
  };

  // const urls = {
  //   DataManager: '/data_manager',
  //   ModelTrainer: '/model_trainer',
  //   Predictors: '/predictors',
  //   Users:'/users',
  // };

  return (
    <URLContext.Provider value={urls}>
      {children}
    </URLContext.Provider>
  );
};

export default URLProvider;