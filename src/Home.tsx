import { Button, Flex } from "@react-native-material/core";
import { RootStackParamList, serverUrl } from "./App";
import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList,'Home'>;
// todo: check typescript best practices here
export default function Home({navigation}:  HomeScreenProps): React.JSX.Element {

    return (
        <Flex fill direction="column" justify="center" style={{ backgroundColor: "black" }}>
            <Button title="Add New Clinic" style={{ width: "auto", marginHorizontal: 32, marginBottom: 16 }} onPress={() => {
                navigation.navigate("CreateDoctor");
            }} />
            <Button title="Update Clinic" style={{ width: "auto", marginHorizontal: 32 }} onPress={() => {
                navigation.navigate("UpdateDoctor");
            }} />
        </Flex>
    )
}