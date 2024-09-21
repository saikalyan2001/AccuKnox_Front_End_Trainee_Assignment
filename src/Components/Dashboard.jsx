import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Pie, Doughnut, Line, Bar } from "react-chartjs-2";
import { useSelector, useDispatch } from "react-redux";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { MdClose, MdAdd, MdSearch } from "react-icons/md";
import "./Dashboard.css";

// Register Chart.js components
Chart.register(
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// Function to get initial data for widgets
const getInitialData = () => ({
  labels: ["label 1", "label 2", "label 3"],
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(255, 206, 86, 0.6)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(255, 206, 86, 1)",
      ],
      borderWidth: 1,
    },
  ],
});

// Chart options
const chartOptions = {
  plugins: {
    legend: {
      display: false,
    },
  },
};

// Function to recalculate totals from widget data
const recalculateTotal = (data) => {
  return data.datasets[0].data.reduce((acc, value) => acc + value, 0);
};

// Inside Dashboard component
const Dashboard = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories);
  const [selectedType, setSelectedType] = useState("Pie");
  const [widgetName, setWidgetName] = useState("");
  const [widgetText, setWidgetText] = useState("");
  const [showWidgetForm, setShowWidgetForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [widgetCategory, setWidgetCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/Data/Data.json");
        const data = await response.json();
        const newCategories = data.categories.reduce((acc, category) => {
          acc[category.name] = category.widgets.map((widget) => ({
            ...widget,
            total: recalculateTotal(widget.data),
          }));
          return acc;
        }, {});
        dispatch({ type: "SET_CATEGORIES", payload: newCategories });
        localStorage.setItem("categories", JSON.stringify(newCategories));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Fetch initially
    fetchCategories();

    // Set up polling
    const interval = setInterval(fetchCategories, 60000); // Poll every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, [dispatch]);

  const handleTypeChange = (e) => {
    dispatch({ type: "SET_SELECTED_TYPE", payload: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleCategoryModal = () => {
    setShowCategoryModal((prev) => !prev);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleNameChange = (e) => {
    setWidgetName(e.target.value);
  };

  const handleTextChange = (e) => {
    setWidgetText(e.target.value);
  };

  const handleCategoryNameChange = (e) => {
    setNewCategoryName(e.target.value);
  };

  const handleWidgetCategoryChange = (e) => {
    setWidgetCategory(e.target.value);
  };

  const addWidget = () => {
    setShowWidgetForm(true);
  };

  const submitWidget = () => {
    const newWidget = {
      id: uuidv4(),
      type: selectedType,
      data: getInitialData(),
      name: widgetName,
      text: widgetText,
      total: recalculateTotal(getInitialData()),
    };

    dispatch({
      type: "SET_CATEGORIES",
      payload: {
        ...categories,
        [widgetCategory]: [...(categories[widgetCategory] || []), newWidget],
      },
    });

    setWidgetName("");
    setWidgetText("");
    setWidgetCategory("");
    setShowWidgetForm(false);
  };

  const closeModal = () => {
    setShowWidgetForm(false);
  };

  const removeWidget = (category, id) => {
    dispatch({
      type: "SET_CATEGORIES",
      payload: {
        ...categories,
        [category]: categories[category].filter((widget) => widget.id !== id),
      },
    });
  };

  const updateTotals = (category) => {
    const updatedWidgets = categories[category].map((widget) => ({
      ...widget,
      total: recalculateTotal(widget.data),
    }));

    dispatch({
      type: "SET_CATEGORIES",
      payload: {
        ...categories,
        [category]: updatedWidgets,
      },
    });
  };

  const addCategory = () => {
    if (newCategoryName && !categories[newCategoryName]) {
      const updatedCategories = {
        ...categories,
        [newCategoryName]: [],
      };

      dispatch({ type: "SET_CATEGORIES", payload: updatedCategories });
      setNewCategoryName("");
    }
  };

  const removeCategory = (category) => {
    const updatedCategories = { ...categories };
    delete updatedCategories[category];
    dispatch({ type: "SET_CATEGORIES", payload: updatedCategories });
  };

  const filteredWidgets = (category) => {
    return (categories[category] || []).filter(
      (widget) =>
        (widget.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (widget.text || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getChartDataContent = (data) => {
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
      return <div>No data available</div>;
    }

    return data.labels.map((label, index) => (
      <div key={index} className="chart-label">
        <span
          className="color-box"
          style={{
            backgroundColor:
              data.datasets[0]?.backgroundColor?.[index] || "grey",
          }}
        ></span>
        {label} ({data.datasets[0]?.data?.[index] || "N/A"})
      </div>
    ));
  };

  return (
    <div className="dashboard-container">
      <h2>CNAPP Dashboard</h2>
      <button
        className="manage-categories-btn"
        type="button"
        onClick={toggleCategoryModal}
      >
        Manage Categories
      </button>

      {showCategoryModal && (
        <div className="modal-background show">
          <div className="modal-content">
            <span className="close" onClick={toggleCategoryModal}>
              &times;
            </span>
            <h3>Manage Categories</h3>
            <input
              type="text"
              placeholder="New Category Name"
              value={newCategoryName}
              onChange={handleCategoryNameChange}
            />
            <button className="add-category-btn" onClick={addCategory}>
              Add Category
            </button>
            <ul>
              {Object.keys(categories).map((category) => (
                <li key={category}>
                  {category}
                  <button
                    className="remove-category-btn"
                    onClick={() => removeCategory(category)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="search-bar">
        <MdSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="categories-container">
        {categories &&
          Object.keys(categories).map((category) => (
            <div key={category} className="category-container">
              <h3>{category}</h3>
              {categories[category].length === 0 ? (
                <p>No widgets available</p>
              ) : (
                <div className="widget-list">
                  {filteredWidgets(category).map((widget) => (
                    <div key={widget.id} className="widget-item">
                      <h4>{widget.name}</h4>
                      <button
                        className="remove-widget-btn"
                        onClick={() => removeWidget(category, widget.id)}
                      >
                        <MdClose />
                      </button>
                      <div className="chart-content">
                        <div className="chart-container">
                          {widget.type === "Pie" && (
                            <Pie data={widget.data} options={chartOptions} />
                          )}
                          {widget.type === "Doughnut" && (
                            <Doughnut
                              data={widget.data}
                              options={chartOptions}
                            />
                          )}
                          {widget.type === "Line" && (
                            <Line data={widget.data} options={chartOptions} />
                          )}
                          {widget.type === "Bar" && (
                            <Bar data={widget.data} options={chartOptions} />
                          )}
                        </div>
                        <div className="chart-total">Total: {widget.total}</div>
                        <div className="chart-data-content">
                          {getChartDataContent(widget.data)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="add-widget-btn"
                onClick={() => {
                  setWidgetCategory(category);
                  addWidget();
                }}
              >
                Add Widget
                <MdAdd className="add-icon" />
              </button>
            </div>
          ))}
      </div>

      {showWidgetForm && (
        <div className="modal-background">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h3>Add Widget</h3>
            <select value={selectedType} onChange={handleTypeChange}>
              <option value="Pie">Pie</option>
              <option value="Doughnut">Doughnut</option>
              <option value="Line">Line</option>
              <option value="Bar">Bar</option>
            </select>
            <select
              value={widgetCategory}
              onChange={handleWidgetCategoryChange}
            >
              <option value="">Select Category</option>
              {Object.keys(categories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Widget Name"
              value={widgetName}
              onChange={handleNameChange}
            />
            <button className="submit-widget-btn" onClick={submitWidget}>
              Submit
            </button>
            <button className="close-widget-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
