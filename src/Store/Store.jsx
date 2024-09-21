// store.js
import { createStore } from 'redux';


const loadFromLocalStorage = () => {
    try {
      const serializedState = localStorage.getItem('categories');
      return serializedState ? JSON.parse(serializedState) : {}; // Ensure it returns an object
    } catch (e) {
      console.error("Failed to load from local storage:", e);
      return {}; // Default to empty object on error
    }
  };
  

const saveToLocalStorage = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('categories', serializedState);
    } catch (e) {
      console.error("Could not save state", e);
    }
  };
  

  // Initial state
const initialState = {
    categories: loadFromLocalStorage(),
    selectedType: "Pie",
    selectedCategory: "",
    searchQuery: "",
  };


  const reducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
      case 'SET_CATEGORIES':
        newState = { ...state, categories: action.payload };
        saveToLocalStorage(newState.categories); // Save to local storage
        return newState;
      case 'SET_SELECTED_TYPE':
        return { ...state, selectedType: action.payload };
      case 'SET_SELECTED_CATEGORY':
        return { ...state, selectedCategory: action.payload };
      case 'SET_SEARCH_QUERY':
        return { ...state, searchQuery: action.payload };
      default:
        return state;
    }
  };
  

// Create store
const store = createStore(reducer);

export default store;
