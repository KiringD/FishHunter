import { useEffect } from 'react';
import { useNavigate, /* other hooks */ } from 'react-router-dom'; 

const WithRouter = (props) => {
  const navigate = useNavigate();
  // other hooks
  const Element = props.routeElement

  useEffect(() => {
    // Вызывайте navigate() внутри useEffect
    navigate();
  }, []);

  return (
    <Element
      {...props}
      navigate={navigate}
    />
  );
};

export default WithRouter;

// import React from "react";
// import { useLocation, useParams } from "react-router-dom";

// const ElementWrapper = (props) => {
//   const params = useParams();
//   const locations = useLocation();
//   const Element = props.routeElement;

//   return <Element params={params} locations={locations} {...props} />;
// };

// export default ElementWrapper;