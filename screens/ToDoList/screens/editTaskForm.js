import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
  Keyboard,
  StatusBar,
  Platform,
  TouchableOpacity
} from "react-native";
import { globalStyles } from "../presentational/globalStyles";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Formik } from "formik";
import {List} from 'react-native-paper'
import * as yup from "yup";
import moment from "moment";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

export default function EditTaskForm({
  handleEditTask,
  oldTitle,
  oldDesc,
  oldCat,
  oldDateTime,
  identifier,
  closeModal
}) {
  const taskSchema = yup.object({
    Title: yup.string().required().min(4).max(25),
    Description: yup.string().required().min(8),
  });

  const [dateTime, setDateTime] = useState(moment(
    oldDateTime, "Do MMMM YYYY, h:mm a").toDate()
  );
  const [mode, setMode] = useState("date");
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [selectedCat, setSelectedCat] = useState(oldCat);
  const titleValidator = yup.string().required().min(4).max(25);
  const descValidator = yup.string().required().min(8);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDateTime(currentDate);
  };

  const showMode = (currentMode) => {
    if (currentMode === "date") {
      setShowDate(!showDate);
    } else {
      setShowTime(!showTime);
    }
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={globalStyles.container}>
        <StatusBar barStyle="dark-content" />
        <Formik
          initialValues={{ Title: oldTitle, Description: oldDesc }}
          validationSchema={taskSchema}
          onSubmit={async (values) => {
            await Notifications.cancelScheduledNotificationAsync(identifier);
            handleEditTask(
              values,
              selectedCat,
              dateTime,
              moment(dateTime).format("Do MMMM YYYY, h:mm a"),
              parseInt(moment(dateTime).format("YYYYMMDDHHmm"))
            );
          }}
        >
          {(props) => (
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelText}> Cancel </Text>
                </TouchableOpacity>
                <Text style={styles.headerText}> Edit Task </Text>
                {titleValidator.isValidSync(props.values.Title) &&
                 descValidator.isValidSync(props.values.Description) ? (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => props.handleSubmit()}
                  >
                    <Text style={styles.addTextAfterValidation}> Edit </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.addText}> Edit </Text>
                )}
              </View>
              <ScrollView style={styles.scrollView}>
                <Text style = {globalStyles.bodyText}> Edit Task Title: </Text>
                <TextInput
                  style={globalStyles.input}
                  onChangeText={props.handleChange("Title")}
                  value={props.values.Title}
                  onBlur={props.handleBlur("Title")}
                />
                <Text style={globalStyles.errorText}>
                  {props.touched.Title && props.errors.Title}
                </Text>

                <Text style={globalStyles.bodyText}> Edit Task Category: </Text>
                <Picker
                  style={styles.picker}
                  selectedValue={selectedCat}
                  onValueChange={(itemValue, itemIndex) =>
                    setSelectedCat(itemValue)
                  }
                >
                  <Picker.Item label="School" value="School" />
                  <Picker.Item label="Work" value="Work" />
                  <Picker.Item label="Personal" value="Personal" />
                  <Picker.Item label="Leisure" value="Leisure" />
                  <Picker.Item label="Others" value="Others" />
                </Picker>

                <Text style = {globalStyles.bodyText}> Edit Task Description: </Text>
                <TextInput
                  multiline
                  minHeight={80}
                  style={globalStyles.input}
                  onChangeText={props.handleChange("Description")}
                  value={props.values.Description}
                  onBlur={props.handleBlur("Description")}
                />
                <Text style={globalStyles.errorText}>
                  {props.touched.Description && props.errors.Description}
                </Text>
                <View style = {{marginBottom: 10}}>
                    <Text style={globalStyles.bodyText}> Edit Date/Time: </Text>
                </View>
                <View>
                  <List.Item
                    style={styles.item}
                    title="Set Date"
                    titleStyle={styles.title}
                    left={() => (
                      <View style={{ justifyContent: "center" }}>
                        <Ionicons name="calendar" color="#666666" size={24} />
                      </View>
                    )}
                    right={() => (
                      <View style={{ justifyContent: "center" }}>
                        {showDate ? (
                          <MaterialIcons
                            name="expand-less"
                            color="#666666"
                            size={30}
                            onPress={() => {
                              showDatepicker();
                              setShowTime(false);
                            }}
                          />
                        ) : (
                          <MaterialIcons
                            name="expand-more"
                            color="#666666"
                            size={30}
                            onPress={() => {
                              showDatepicker();
                              setShowTime(false);
                            }}
                          />
                        )}
                      </View>
                    )}
                    description="Date to do this task"
                    descriptionStyle={styles.description}
                    onPress={() => {
                      showDatepicker();
                      setShowTime(false);
                    }}
                  />

                  <List.Item
                    style={styles.item}
                    title="Set Time"
                    titleStyle={styles.title}
                    left={() => (
                      <View style={{ justifyContent: "center" }}>
                        <Ionicons name="alarm" color="#666666" size={24} />
                      </View>
                    )}
                    right={() => (
                      <View style={{ justifyContent: "center" }}>
                        {showTime ? (
                          <MaterialIcons
                            name="expand-less"
                            color="#666666"
                            size={30}
                            onPress={() => {
                              showTimepicker();
                              setShowDate(false);
                            }}
                          />
                        ) : (
                          <MaterialIcons
                            name="expand-more"
                            color="#666666"
                            size={30}
                            onPress={() => {
                              showTimepicker();
                              setShowDate(false);
                            }}
                          />
                        )}
                      </View>
                    )}
                    description="Time to do this task"
                    descriptionStyle={styles.description}
                    onPress={() => {
                      showTimepicker();
                      setShowDate(false);
                    }}
                  />
                  {(showDate || showTime) && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={dateTime}
                      mode={mode}
                      display="spinner"
                      is24Hour={true}
                      onChange={onChange}
                    />
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          )}
        </Formik>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  picker: {
    marginBottom: 9,
  },
  dateTime: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  headerText: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
  cancelButton: {
    position: "absolute",
    left: 0,
  },
  cancelText: {
    fontSize: 18,
    color: "crimson",
  },
  addButton: {
    position: "absolute",
    right: 0,
  },
  addText: {
    fontSize: 18,
    color: "crimson",
    opacity: 0.6,
    position: "absolute",
    right: 0,
  },
  addTextAfterValidation: {
    fontSize: 18,
    color: "crimson",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  modalContent: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
    flex: 1,
  },
  title: {
    alignSelf: "center",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 3
  },
  description: {
    alignSelf: "center",
    fontSize: 14,
  },
  item: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.4,
    borderBottomColor: "#999",
  },
});
