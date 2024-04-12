
import { Button, Flex, TextInput } from "@react-native-material/core";
import React, { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { DoctorDataDTO, HttpStatusCode, RootStackParamList, serverUrl } from "./App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type UpdateDoctorScreenProps = NativeStackScreenProps<RootStackParamList, 'UpdateDoctor'>;

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
export default function UpdateDoctor({ navigation }: UpdateDoctorScreenProps): React.JSX.Element {

    const [selectedDoctor, setSelectedDoctor] = useState<DoctorDataDTO | null>(null);
    const [scheduleBoxHeight, setScheduleBoxHeight] = useState(0);
    const [doctorName, setDoctorName] = useState("");
    const [doctorSchedule, setDoctorSchedule] = useState("");
    const [doctorPassword, setDoctorPassword] = useState("");
    const [doctorsList, setDoctorsList] = useState<DoctorDataDTO[]>([]);
    
    const dropdownRef = useRef<SelectDropdown>(null);

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

    async function handleUpdateDoctor(selectedDoctor: DoctorDataDTO, doctorName: string, doctorPassword: string, 
        doctorSchedule: string): Promise<boolean> {
        try {
            const doctorDataDto: DoctorDataDTO = {
                _id: selectedDoctor._id,
                name: "" // empty name passed to the server means no update to name
            }
            if(doctorName.trim() !== selectedDoctor.name) {
                doctorDataDto.name = doctorName.trim();
            }
            if (doctorPassword) {
                doctorDataDto.password = doctorPassword.trim()
            }
            if (doctorSchedule !== selectedDoctor.schedule) {
                doctorDataDto.schedule = doctorSchedule
            }
            const resourceUrl = `${serverUrl}/doctor`;
            const updateResponse = await fetch(`${resourceUrl}/`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(doctorDataDto),
            });
            if(updateResponse.status !== HttpStatusCode.OK) {
                const responseJson = await updateResponse.json();
                console.error(responseJson.message);
                throw new Error(`Error response from server while creating doctor: {status: ${updateResponse.status}, message: ${responseJson.message}`)
            }
            const updateResponseJson = await updateResponse.json()
            if (updateResponseJson.message === "Record matches completely. Nothing to update") {//todo: make this check better
                console.log(updateResponseJson.message)
            }
            else {
                console.log("Successfully updated doctor");
                const fetchDoctorsResponse = await fetchDoctors();
                if (fetchDoctorsResponse.doctorsList) {
                    setDoctorsList(fetchDoctorsResponse.doctorsList);
                    console.log("Successfully fetched doctors list from the server : ", fetchDoctorsResponse.doctorsList);
                }
                else {
                    console.log("Error fetching doctorsList from the server: ", fetchDoctorsResponse.message);
                    // todo: handle error
                }
            }
        } catch (error) {
            console.error("There was an error udpating doctor.", error);
            return Promise.resolve(false);
        }
        return Promise.resolve(true)
    }

    function reset() {
        setSelectedDoctor(null)
        dropdownRef.current?.reset()
        setDoctorName("")
        setDoctorPassword("")
        setDoctorSchedule("")
    }

    return (
        <Flex fill direction="column" justify="center" style={{ backgroundColor: "black" }}>
            <SelectDropdown
                buttonStyle={{ width: "auto", marginHorizontal: 32, marginBottom: 5, borderRadius: 5 }}
                buttonTextStyle={{ textAlign: "left" }}
                rowTextStyle={{ textAlign: "left" }}
                defaultButtonText="Select Doctor"
                data={doctorsList}
                onSelect={selectedDoctorListItem => {
                    setSelectedDoctor(selectedDoctorListItem);
                    setDoctorName(selectedDoctorListItem.name)
                    setDoctorSchedule(selectedDoctorListItem.schedule);
                    setDoctorPassword("");
                }}
                ref={dropdownRef}
                buttonTextAfterSelection={selectedDoctorListItem => `Dr. ${selectedDoctorListItem.name}`}
                rowTextForSelection={doctorListItem => `Dr. ${doctorListItem.name}`}
            />
            <TextInput
                label="Update name"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 8, height: Math.max(35, scheduleBoxHeight) }}
                value={doctorName}
                onChangeText={text => setDoctorName(text)} />
            <TextInput
                multiline
                onContentSizeChange={(event) => setScheduleBoxHeight(event.nativeEvent.contentSize.height)}
                label="Doctor's Schedule"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 8, height: Math.max(35, scheduleBoxHeight) }}
                value={doctorSchedule}
                onChangeText={text => setDoctorSchedule(text)} />
            <TextInput
                label="Enter new password"
                style={{ width: "auto", marginHorizontal: 32, marginBottom: 16, height: Math.max(35, scheduleBoxHeight) }}
                value={doctorPassword}
                onChangeText={text => setDoctorPassword(text)} />
            <Button title="Submit" style={{ width: "auto", marginHorizontal: 32, marginBottom: 8 }} onPress={async () => {
                if (selectedDoctor) {
                    if (doctorPassword.trim() || selectedDoctor.schedule !== doctorSchedule || selectedDoctor.name !== doctorName.trim()) {
                        if(doctorName.trim() !== selectedDoctor.name && 
                            doctorsList
                                .filter(doctor => doctor.name.toLowerCase() === doctorName.trim().toLowerCase())
                                .filter(doctor => doctor._id !== selectedDoctor._id).length > 0) {
                            Alert.alert("Doctor with this name already exists");
                        }
                        else {
                            const updated = await handleUpdateDoctor(selectedDoctor, doctorName, doctorPassword, doctorSchedule);
                            if(updated) {
                                Alert.alert("Doctor Updated Successfully");
                                reset();
                            }
                            else {
                                Alert.alert("There was some error updating the doctor. Please check logs.")
                            }
                        }
                    }
                    else {
                        Alert.alert("Nothing to update")
                    }
                }
                else {
                    Alert.alert("Please select a doctor to update.")
                }
            }}
            />
            <Button title="Go Back"
                style={{ width: "auto", marginHorizontal: 32 }}
                // disabled={submitDisabled}
                onPress={() => { navigation.goBack() }}
            />
        </Flex>
    );
}