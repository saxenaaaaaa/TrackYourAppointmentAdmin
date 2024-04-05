import { Button, Flex, TextInput } from "@react-native-material/core";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { DoctorDataDTO, HttpStatusCode, RootStackParamList, serverUrl } from "./App";
import { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";

type CreateDoctorScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateDoctor'>;

async function fetchDoctors(): Promise<any> {
    const resourceUrl = `${serverUrl}/doctor`
    console.log("Resource url is : ", resourceUrl);
    const response = await fetch(`${resourceUrl}/`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        }
    });
    return response.json()
} 

// todo: check typescript best practices here
export default function CreateDoctor({ navigation }: CreateDoctorScreenProps): React.JSX.Element {

    // const existingDoctorsList = route.params.existingDoctorsList
    const [doctorName, setDoctorName] = useState("");
    const [doctorPassword, setDoctorPassword] = useState("");
    const [doctorSchedule, setDoctorSchedule] = useState("");
    const [scheduleBoxHeight, setScheduleBoxHeight] = useState(0);
    // const [submitDisabled, setSubmitDisabled] = useState(false);

    const [doctorsList, setDoctorsList] = useState<DoctorDataDTO[] | null>(null);
  // const [updateList, setUpdateList]

    useEffect(() => {
        (async () => {
            try {
                const fetchDoctorsResponse = await fetchDoctors();
                if (fetchDoctorsResponse.doctorsList) {
                    setDoctorsList(fetchDoctorsResponse.doctorsList);
                    console.log("Successfully fetched doctors list from the server : ", fetchDoctorsResponse.doctorsList);
                }
                else {
                    console.log("Error fetching doctorsList from the server: ", fetchDoctorsResponse.message);
                    // todo: handle error
                }
            } catch (error) {
                console.error("There was an error getting doctor's list from the server: ", error);
            }
        })();
    }, []); // todo: re-check what should be there in the dependency list

    function reset() {
        setDoctorName("")
        setDoctorPassword("")
        setDoctorSchedule("")
    }

    async function handleSubmit(doctorName: string, doctorPassword: string, doctorSchedule: string): Promise<boolean> {
        try {
            const doctorDataDto: DoctorDataDTO = {
                name: doctorName.trim(),
                password: doctorPassword.trim(),
                schedule: doctorSchedule.trim()
            }
            const resourceUrl = `${serverUrl}/doctor`;
            const response = await fetch(`${resourceUrl}/`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(doctorDataDto),
            });
            if(response.status !== HttpStatusCode.OK) {
                const responseJson = await response.json();
                console.error(responseJson.message);
                throw new Error(`Error response from server while creating doctor: {status: ${response.status}, message: ${responseJson.message}`)
            }
            console.log("Successfull created new doctor");
            const fetchDoctorsResponse = await fetchDoctors();
            if (fetchDoctorsResponse.doctorsList) {
                setDoctorsList(fetchDoctorsResponse.doctorsList);
                console.log("Successfully fetched doctors list from the server : ", fetchDoctorsResponse.doctorsList);
            }
            else {
                console.log("Error fetching doctorsList from the server: ", fetchDoctorsResponse.message);
                // todo: handle error
            }
        } catch (error) {
            console.error("There was an error creating doctor.", error);
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }

    return (
        <Flex fill direction="column" justify="center" style={{ backgroundColor: "black" }}>
            <TextInput
                label="Enter Doctor's Name"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 8 }}
                value={doctorName}
                onChangeText={text => setDoctorName(text)} />
            <TextInput
                label="Enter Password"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 8 }}
                value={doctorPassword}
                onChangeText={text => setDoctorPassword(text)} />
            <TextInput
                multiline
                onContentSizeChange={(event) => setScheduleBoxHeight(event.nativeEvent.contentSize.height)}
                label="Doctor's Schedule"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 15, height: Math.max(35, scheduleBoxHeight) }}
                value={doctorSchedule}
                onChangeText={text => setDoctorSchedule(text)} />
            <Button title="Submit"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 8 }}
                // disabled={submitDisabled}
                onPress={async () => {
                    // todo: should I do an explicit check for existingDoctorsList == undefined here, and return if 
                    //       the existingDoctorsList is not yet loaded ?
                    //       If we add this check, we would not be able to submit without the list loading. 
                    //       Hence, we can ensure that submit proceeds only after checking the list.
                    // console.log("Existing Doctor list - ", doctorsList)
                    // console.log("is doctor equal : ", doctorsList.filter(doctor => doctor.name === doctorName))
                    if(doctorsList == null || doctorsList == undefined) {
                        Alert.alert("Please wait for doctor list to load.");
                    }
                    else if (doctorsList.filter(doctor => doctor.name.toLowerCase() === doctorName.trim().toLowerCase()).length > 0) {
                        Alert.alert("Doctor Already exists");
                    }
                    else if (doctorName.trim() && doctorSchedule.trim() && doctorPassword.trim()) {
                        const created = await handleSubmit(doctorName, doctorPassword, doctorSchedule);
                        if(created) {
                            Alert.alert("Doctor Created Successfully");
                            reset()
                        }
                        else {
                            Alert.alert("There was an error creating the doctor. Please check logs")
                        }
                    }   
                    else {
                        Alert.alert("All fields are mandatory");
                    }
                }}
            />
            <Button title="Go Back"
                style={{ width: "auto", marginHorizontal: 32 }}
                // disabled={submitDisabled}
                onPress={() => { navigation.goBack() }}
            />
        </Flex>
    )
}