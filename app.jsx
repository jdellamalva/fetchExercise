const Pagination = ({ items, pageSize, onPageChange }) => {
    const { Button } = ReactBootstrap;
    if (items.length <= 1) return null;
  
    let num = Math.ceil(items.length / pageSize);

    let pages = range(1, num); // updated to fix page numbering issue

    const list = pages.map(page => {
      return (
        <Button key={page} onClick={onPageChange} className="page-item">
          {page}
        </Button>
      );
    });
    return (
      <nav>
        <ul className="pagination">{list}</ul>
      </nav>
    );
  };
  
  const range = (start, end) => {
    return Array(end - start + 1)
      .fill(0)
      .map((item, i) => start + i);
  };
  
  function paginate(items, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    let page = items.slice(start, start + pageSize);
    return page;
  }
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData
    });
  
    useEffect(() => {
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };

  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true
        };
      default:
        throw new Error();
    }
  };

  function App() {
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
       "https://api.nobelprize.org/2.1/laureates",
        {
            laureates: []
        }
    );

    const handlePageChange = e => {
      setCurrentPage(Number(e.target.textContent));
    };

    let filteredData = data.laureates.filter(laureate =>
        laureate.knownName.en.toLowerCase().includes(query.toLowerCase())
      );
    
    let page = [];
    if (filteredData.length >= 1) {
      page = paginate(filteredData, currentPage, pageSize);
    //   console.log(`currentPage: ${currentPage}`);
    }

    return (
      <Fragment>
        <form
        //   onSubmit={event => {
        //     doFetch(`https://api.nobelprize.org/2.1/laureates/${query}`);
        //     event.preventDefault();
        //   }}
        >
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          {/* <button type="submit">Search</button> */}
        </form>
  
        {isError && <div>Something went wrong ...</div>}
  
        {isLoading ? (
          <div>Loading ...</div>
        ) : (
          <ul className="list-group">
            {page.map(item => (
              <li key={item.id} className="list-group-item">
                <a href={item.wikipedia.english}>{item.knownName.en}</a>
              </li>
            ))}
          </ul>
        )}
        <Pagination
          items={filteredData}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        ></Pagination>
      </Fragment>
    );
  }
  
  // ========================================
  ReactDOM.render(<App />, document.getElementById("root"));
  