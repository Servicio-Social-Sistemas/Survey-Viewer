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
  createIcon,
} from "@chakra-ui/react";

const Pi = 3.141592653;

const SendIcon = createIcon({
  displayName: "SendIcon",
  viewBox: "0 0 24 24",
  d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
});

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
      bg='gray.100'
      mt='auto'
      border='30px'
      borderColor='black.900'
    >
      
      <Box p={4} h='fit-content' style={{display:'flex',flexDirection:'column',gap:{Pi}}}>
        <Heading mt={Pi+9}>{surveyData.name}</Heading>
        <Text>{capitalizeFirstLetter(surveyData.description)}</Text>
        {surveyData.questions.map((question, questionIndex) => (
          <Box key={questionIndex} mt={4}>
            <Heading as="h2" size="md">
              {questionIndex + 1}. {capitalizeFirstLetter(question.question)}
            </Heading>
            {/*<Text>Tipo de Pregunta: {question.type}</Text>*/}
            {question.type === "MULTIPLE_CHOICE" && (
              <Text fontStyle="italic" fontSize="sm">
                Seleccione una o más opciones
              </Text>
            )}
            {question.type === "OPEN_ENDED" ? (
              <Input
                mt={Pi}
                type="text"
                placeholder="Escribe tu respuesta aquí..."
                value={userResponses[questionIndex] || ""}
                onChange={(e) =>
                  handleInputResponseChange(questionIndex, e.target.value)
                }
              />
            ) : (
              <List style={{display: 'flex', flexDirection:'row', flexWrap:'wrap',gap:'40px'}}>
                {question.options.map((option, optionIndex) => (
                  <ListItem key={optionIndex} mt={2}>
                    <Button
                      mt={Pi}
                      value={option}
                      variant = {userResponses[questionIndex]?.includes(option) ? 'solid' : 'outline'}
                      colorScheme={userResponses[questionIndex]?.includes(option) ? 'blue' : 'gray'}
                      onClick={() =>
                        handleResponseChange(questionIndex, option)
                      }
                    >
                      {capitalizeFirstLetter(option)}
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        ))}
        <Box textAlign="center">
          <Button
            rightIcon={<SendIcon />}
            mt={6}
            colorScheme="blue"
            onClick={handleSaveResponses}
          >
            Enviar
          </Button>
        </Box>
      </Box>
      <Toaster />
    </Flex>
  );
};

export default SurveyViewer;
