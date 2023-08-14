import { Container } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import SurveyViewer from "./Components/SurveyView";
import "./App.css";

function App() {
  return (
    <Container maxW={"100%"} h={"100vh"} background='gray.200'>
      <Routes>
        <Route path="/survey/:surveyId" element={<SurveyViewer />} />
      </Routes>
      {/* <SurveyViewer></SurveyViewer> */}
    </Container>
  );
}

export default App;
