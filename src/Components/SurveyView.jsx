import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Input,
  Flex,
  Button,
  Checkbox,
} from "@chakra-ui/react";

const SurveyViewer = () => {
  const [surveyData, setSurveyData] = useState(null);
  const [userResponses, setUserResponses] = useState({});
  const [userPosition, setUserPosition] = useState(null);

  let { surveyId } = useParams();

  console.log(surveyId);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_PUBLIC_DATA}/get/${surveyId}`
        );

        console.log(response);

        if (response.status === 200) {
          setSurveyData(response.data);
        } else {
          console.error("Error fetching survey data:", response.statusText);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    fetchSurveyData();
  }, [surveyId]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error fetching user's position:", error);
      }
    );
  }, []);

  const handleResponseChange = (questionIndex, option) => {
    setUserResponses((prevResponses) => {
      const updatedResponses = { ...prevResponses };

      if (!updatedResponses[questionIndex]) {
        updatedResponses[questionIndex] = [];
      }

      if (surveyData.questions[questionIndex].type === "SINGLE_CHOICE") {
        updatedResponses[questionIndex] = [option];
      } else {
        if (updatedResponses[questionIndex].includes(option)) {
          updatedResponses[questionIndex] = updatedResponses[
            questionIndex
          ].filter((response) => response !== option);
        } else {
          updatedResponses[questionIndex].push(option);
        }
      }

      return updatedResponses;
    });
  };

  const handleInputResponseChange = (questionIndex, value) => {
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [questionIndex]: value,
    }));
  };

  const handleSaveResponses = async () => {
    try {
      const userSurveyResponses = surveyData.questions.map(
        (question, questionIndex) => {
          if (question.type === "OPEN_ENDED") {
            return {
              question: question.question,
              response: [userResponses[questionIndex] || ""],
            };
          } else {
            return {
              question: question.question,
              response: userResponses[questionIndex] || [],
            };
          }
        }
      );

      console.log("User Survey Responses:", userSurveyResponses);

      const response = await axios.post(
        `${import.meta.env.VITE_PUBLIC_DATA}/submit/${surveyId}`,
        {
          surveyId: surveyId,
          responses: userSurveyResponses,
          location: userPosition,
        }
      );

      if (response.status === 200) {
        toast.success("Respuestas enviadas con éxito");
      } else {
        console.error("Error al guardar las respuestas:", response.statusText);
      }
    } catch (error) {
      toast.error("An error occurred:", error);
    }
  };

  if (!surveyData) {
    return <div>Loading...</div>;
  }

  return (
    <Flex
      align={"center"}
      w={"full"}
      justify={"center"}
      minH={"max-content"}
      mt={8}
    >
      <Box p={4}>
        <Heading>{surveyData.name}</Heading>
        <Text>{surveyData.description}</Text>
        {surveyData.questions.map((question, questionIndex) => (
          <Box key={questionIndex} mt={4}>
            <Heading as="h2" size="md">
              Pregunta {questionIndex + 1}: {question.question}
            </Heading>
            <Text>Tipo de Pregunta: {question.type}</Text>
            {question.type === "OPEN_ENDED" ? (
              <Input
                type="text"
                value={userResponses[questionIndex] || ""}
                onChange={(e) =>
                  handleInputResponseChange(questionIndex, e.target.value)
                }
                mt={2}
              />
            ) : (
              <List>
                {question.options.map((option, optionIndex) => (
                  <ListItem key={optionIndex}>
                    <Checkbox
                      value={option}
                      isChecked={
                        userResponses[questionIndex]?.includes(option) || false
                      }
                      onChange={() =>
                        handleResponseChange(questionIndex, option)
                      }
                    >
                      {option}
                    </Checkbox>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        ))}
        <Button mt={4} colorScheme="blue" onClick={handleSaveResponses}>
          Guardar Respuestas
        </Button>
      </Box>
      <Toaster />
    </Flex>
  );
};

export default SurveyViewer;
