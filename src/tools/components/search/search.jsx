import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import Checkbox from "../checkbox/checkbox.jsx";
import {getCapsules} from "../../../redux/slices/capsule-slice.js";
import ModalOverlay from "../modal-overlay/modal-overlay.jsx";
import CapsuleDetail from "../capsule-detail/capsule-detail.jsx";
import Capsules from "../capsules/capsules.jsx";
import {useCapsuleServices} from "../../../context/capsule-context.jsx";
import {RxCaretLeft} from "react-icons/rx";

const Search = () => {
  const {range} = useCapsuleServices();
  const [filters, setFilters] = useState({
    status: {},
    type: {},
    original_launch: {},
  });
  const [capsule, setCapsule] = useState({});
  const [modalOn, setModalOn] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const {capsules, statuses, types, original_launches} = useSelector((state) => state.capsules);
  const searchRef = useRef();
  const rowsRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCapsules({})).unwrap().then((response) => {
      if (response) {
        const statusFilter = {}
        const typeFilter = {};
        const launchFilter = {};
        statuses.map((status) => {
          if (status) {
            statusFilter[status] = false;
          }
        });
        original_launches.map((launch) => {
          if (launch) {
            launchFilter[launch] = false;
          }
        });
        types.map((type) => {
          if (type) {
            typeFilter[type] = false;
          }
        });
        setFilters({...filters, status: statusFilter, type: typeFilter, original_launch: launchFilter})
      }
    });
  }, [dispatch, statuses.length, types.length, original_launches.length]);

  const checkedCapsules = [...Object.entries(filters.status), ...Object.entries(filters.type), ...Object.entries(filters.original_launch)]
    .filter(filter => filter[1])
    .map(filter => filter[0]);

  const filteredCapsules = capsules.filter(({status, original_launch, type}) => {
      return checkedCapsules.includes(status) || checkedCapsules.includes(type) || checkedCapsules.includes(original_launch)
    }
  );

  const handleFilter = (e) => {
    const {name, dataset: {filter}} = e.target;
    return setFilters({...filters, [filter]: {...filters[filter], [name]: !filters[filter][name]}});
  }

  const handleSearch = () => {
    const {value} = searchRef.current;
    if (value !== "") {
      setPage(1);
      rowsRef.current.value = 100;
      setRowsPerPage(100);
    } else {
      rowsRef.current.value = 9;
      setRowsPerPage(9);
    }
    setSearch(value.toLowerCase());
  }

  return (
    <>
      {modalOn && <ModalOverlay setModalOn={setModalOn}>
        <CapsuleDetail capsule={capsule}/>
      </ModalOverlay>}
      <section className="flex flex-col justify-center items-center w-full py-10 px-20">
        <div className="flex items-center space-x-2 w-9/12">
          <input
            ref={searchRef}
            className="w-full sm:max-w-[200px] md:w-full md:max-w-full h-full px-3 py-2 text-gray-700 text-md placeholder-gray-500 focus:ring-0 focus:placeholder-gray-400 text-sm md:text-normal border border-gray-300 rounded-full focus:text-gray-700 focus:bg-white focus:outline-none"
            type="search"
            placeholder="Search by capsule serial eg. C101"
            onChange={handleSearch}
          />
        </div>
        <div className="mt-2">
          <button onClick={() => setPage(1)}
                  className="border py-2 px-4 hover:bg-black hover:text-white rounded-l-md">{"<<"}</button>
          {range.map((range, index) => {
            return (
              <button key={index} onClick={() => setPage(range)}
                      className={`${page === range ? 'bg-black text-white' : ''} border py-2 px-5 hover:bg-black hover:text-white`}>{range}</button>
            );
          })}
          <button onClick={() => setPage(range[range.length - 1])}
                  className="border py-2 px-4 hover:bg-black hover:text-white rounded-r-md">{">>"}</button>
        </div>
      </section>
      <section className="flex w-full px-20 mx-auto">
        {/*Filter Section*/}
        <section className="w-3/12">
          <div className="flex flex-col space-y-5 p-5 shadow-md rounded-md">
            <div className="flex">
              <p>Showing:</p><select
              ref={rowsRef}
              onChange={(e) => {
                setPage(1);
                setRowsPerPage(e.target.value);
              }}
              className="ml-2 text-gray-600 outline-none text-sm p-1 select-none cursor-pointer bg-gray-50"
            >
              <option value="9">9 Capsules</option>
              <option value="12">12 Capsules</option>
              <option value={capsules.length}>All Capsules</option>
            </select>
            </div>
            <div>
              <h2 className="font-bold">Status</h2>
              {statuses.map((status, index) => {
                if (status)
                  return <Checkbox
                    key={index}
                    name={status}
                    id="status"
                    checked={filters.status[status]}
                    handleFilter={handleFilter}/>
              })}
            </div>
            <div><h2 className="font-bold">Type</h2>
              {types.map((type, index) => {
                if (type)
                  return <Checkbox
                    key={index}
                    name={type} id="type"
                    checked={filters.type[type]}
                    handleFilter={handleFilter}/>
              })}</div>

            <div><h2 className="font-bold">Original Launch</h2>
              {original_launches.map((launch, index) => {
                if (launch)
                  return <Checkbox
                    key={index}
                    name={launch}
                    id="original_launch"
                    checked={filters.original_launch[launch]}
                    handleFilter={handleFilter}/>
              })}
            </div>
          </div>
        </section>

        {/*Data Grid & Search Section*/}
        <section className="p-5 w-9/12 h-fit grid grid-cols-3 gap-2">
          <Capsules onView={(capsule) => {
            setCapsule(capsule)
            setModalOn(true);
          }} search={search} capsules={filteredCapsules.length > 0 ? filteredCapsules : capsules} page={page}
                    rowsPerPage={rowsPerPage}/>
        </section>
      </section>
    </>
  );
}

export default Search;