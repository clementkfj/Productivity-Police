import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { globalStyles } from "../../../Styles/globalStyles";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { List, Switch, IconButton } from "react-native-paper";
import SwitchSelector from "react-native-switch-selector";
import { Formik } from "formik";
import * as yup from "yup";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { setCP2 } from "../../../redux/checkpoint2";
import { setCP3 } from "../../../redux/checkpoint3";
import { setCP1 } from "../../../redux/checkpoint1";
import * as Authentication from "../../../api/auth";
import * as Goals from "../../../api/goals";
import * as Notifications from "expo-notifications";

export default function CreateLongTermGoalsForm({ navigation }) {
  const [dateTime, setDateTime] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [cat, setCat] = useState("School");
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [counter, setCounter] = useState(2);
  const [showCheckpoint2, setShowCheckpoint2] = useState(false);
  const [showCheckpoint3, setShowCheckpoint3] = useState(false);
  const dispatch = useDispatch();
  const { cp1 } = useSelector((state) => state.checkpoint1);
  const { cp2 } = useSelector((state) => state.checkpoint2);
  const { cp3 } = useSelector((state) => state.checkpoint3);

  const validationSchema = yup.object({
    Title: yup.string().required().min(4).max(25),
    EndGoal: yup
      .string()
      .required("End Goal is a required field")
      .min(8, "End Goal must be at least 8 characters"),
  });

  const titleValidator = yup.string().required().min(4).max(25);
  const endGoalValidator = yup.string().required().min(8);

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

  const handleCreateGoal = async (values) => {
    try {
      const CP1DateTime =
        cp1.DateTimeFormatted === undefined
          ? undefined
          : moment(cp1.DateTimeFormatted, "Do MMMM YYYY, h:mm a");
      const CP2DateTime =
        cp2.DateTimeFormatted === undefined
          ? undefined
          : moment(cp2.DateTimeFormatted, "Do MMMM YYYY, h:mm a");
      const CP3DateTime =
        cp3.DateTimeFormatted === undefined
          ? undefined
          : moment(cp3.DateTimeFormatted, "Do MMMM YYYY, h:mm a");

      if (Object.keys(cp2).length !== 0 && Object.keys(cp1).length === 0) {
        Alert.alert(
          "Invalid Checkpoint sequence",
          "Checkpoint 1 cannot be empty if you have filled Checkpoint 2"
        );
      } else if (
        Object.keys(cp3).length !== 0 &&
        (Object.keys(cp1).length === 0 || Object.keys(cp2).length === 0)
      ) {
        Alert.alert(
          "Invalid Checkpoint sequence",
          "Checkpoint 1 or 2 cannot be empty if you have filled Checkpoint 3"
        );
      } else if (
        (CP1DateTime !== undefined &&
          moment(dateTime).diff(CP1DateTime, "minutes", true) <= 0) ||
        (CP2DateTime !== undefined &&
          moment(dateTime).diff(CP2DateTime, "minutes", true) <= 0) ||
        (CP3DateTime !== undefined &&
          moment(dateTime).diff(CP3DateTime, "minutes", true) <= 0)
      ) {
        Alert.alert(
          "Invalid date or time",
          "Your goal completion date and time is before one of your Checkpoints"
        );
      } else if (
        CP1DateTime !== undefined &&
        CP2DateTime !== undefined &&
        CP1DateTime.diff(CP2DateTime, "minutes", true) >= 0
      ) {
        Alert.alert(
          "Invalid date or time",
          "Checkpoint 1 completion date and time cannot be after Checkpoint 2"
        );
      } else if (
        CP1DateTime !== undefined &&
        CP3DateTime !== undefined &&
        CP1DateTime.diff(CP3DateTime, "minutes", true) >= 0
      ) {
        Alert.alert(
          "Invalid date or time",
          "Checkpoint 1 completion date and time cannot be after Checkpoint 3"
        );
      } else if (
        CP2DateTime !== undefined &&
        CP3DateTime !== undefined &&
        CP2DateTime.diff(CP3DateTime, "minutes", true) >= 0
      ) {
        Alert.alert(
          "Invalid date or time",
          "Checkpoint 2 completion date and time cannot be after Checkpoint 3"
        );
      } else {
        let numCheckpoints = 1;
        const title = values.Title;
        values.userId = Authentication.getCurrentUserId();
        values.Category = cat;
        values.DateTimeFormatted = moment(dateTime).format(
          "Do MMMM YYYY, h:mm a"
        );
        values.Priority = parseInt(moment(dateTime).format("YYYYMMDDHHmm"));
        //schedule notif for cp1
        if (CP1DateTime !== undefined) {
          const CP1Identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${title} - Checkpoint 1 ✅`,
              body: `Add some notes to pen down your thoughts!`,
              data: {},
              sound: true,
            },
            trigger: { date: CP1DateTime.toDate() },
          });
          values.Checkpoint1 = { ...cp1, Identifier: CP1Identifier };
        } else {
          values.Checkpoint1 = cp1;
        }
        //schedule notif for cp2
        if (CP2DateTime !== undefined) {
          const CP2Identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${title} - Checkpoint 2 ✅`,
              body: `Add some notes to pen down your thoughts!`,
              data: {},
              sound: true,
            },
            trigger: { date: CP2DateTime.toDate() },
          });
          values.Checkpoint2 = { ...cp2, Identifier: CP2Identifier };
        } else {
          values.Checkpoint2 = cp2;
        }
        //schedule notif for cp3
        if (CP3DateTime !== undefined) {
          const CP3Identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${title} - Checkpoint 3 ✅`,
              body: `Add some notes to pen down your thoughts!`,
              data: {},
              sound: true,
            },
            trigger: { date: CP3DateTime.toDate() },
          });
          values.Checkpoint3 = { ...cp3, Identifier: CP3Identifier };
        } else {
          values.Checkpoint3 = cp3;
        }

        if (Object.keys(cp1).length !== 0) {
          numCheckpoints++;
        }
        if (Object.keys(cp2).length !== 0) {
          numCheckpoints++;
        }
        if (Object.keys(cp3).length !== 0) {
          numCheckpoints++;
        }
        values.numCheckpoints = numCheckpoints;

        //schedule notif for goal
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${title} - Goal Completed ✅`,
            body: `Congrats! Add some notes to pen down your thoughts!`,
            data: {},
            sound: true,
          },
          trigger: { date: dateTime },
        });
        values.Identifier = identifier;
        Goals.createGoal(
          values,
          () => {},
          (error) => Alert.alert(error.message)
        );
        dispatch(setCP1({}));
        dispatch(setCP2({}));
        dispatch(setCP3({}));
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(
        "Invalid date or time",
        "Goal completion date and time must be some time in the future"
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={globalStyles.container}>
        <StatusBar barStyle="dark-content" />
        <Formik
          initialValues={{ Title: "", EndGoal: "" }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleCreateGoal(values)}
        >
          {(props) => (
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    dispatch(setCP1({}));
                    dispatch(setCP2({}));
                    dispatch(setCP3({}));
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.cancelText}> Cancel </Text>
                </TouchableOpacity>
                <Text style={styles.headerText}> New Goal </Text>
                {titleValidator.isValidSync(props.values.Title) &&
                endGoalValidator.isValidSync(props.values.EndGoal) ? (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => props.handleSubmit()}
                  >
                    <Text style={styles.saveTextAfterValidation}> Save </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.saveText}> Save </Text>
                )}
              </View>
              <ScrollView style={styles.scrollView}>
                <Text style={globalStyles.bodyText}> Enter Goal Title: </Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Eg: Get better grades"
                  onChangeText={props.handleChange("Title")}
                  value={props.values.Title}
                  onBlur={props.handleBlur("Title")}
                />
                <Text style={globalStyles.errorText}>
                  {props.touched.Title && props.errors.Title}
                </Text>

                <Text style={globalStyles.bodyText}>
                  {" "}
                  Enter Your End Goal:{" "}
                </Text>
                <TextInput
                  style={globalStyles.input}
                  multiline
                  minHeight={60}
                  placeholder="Eg: CAP 4.5 this coming semester"
                  onChangeText={props.handleChange("EndGoal")}
                  value={props.values.EndGoal}
                  onBlur={props.handleBlur("EndGoal")}
                />
                <Text style={globalStyles.errorText}>
                  {props.touched.EndGoal && props.errors.EndGoal}
                </Text>

                <Text style={{ ...globalStyles.bodyText, marginTop: 5 }}>
                  {" "}
                  Select Goal Category:{" "}
                </Text>
                <SwitchSelector
                  style={{ marginTop: 5, marginBottom: 30 }}
                  options={[
                    { label: "School", value: "School" },
                    { label: "Work", value: "Work" },
                    { label: "Personal", value: "Personal" },
                    { label: "Others", value: "Others" },
                  ]}
                  initial={0}
                  hasPadding
                  onPress={(value) => setCat(value)}
                  selectedColor="#fff"
                  buttonColor="#fa5d5d"
                />

                <Text style={globalStyles.bodyText}>
                  {" "}
                  Set Completion Date and Time:{" "}
                </Text>

                <View style={{ marginTop: 5, marginBottom: 15 }}>
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
                    description="Date to complete this goal by"
                    descriptionStyle={styles.EndGoal}
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
                    description="Time to complete this goal by"
                    descriptionStyle={styles.EndGoal}
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

                <View style={styles.switch}>
                  <Text style={globalStyles.bodyText}>
                    {" "}
                    Add checkpoints for this goal?{" "}
                  </Text>
                  <Switch
                    value={switchOn}
                    onValueChange={async () => {
                      if (Object.keys(cp1).length !== 0) {
                        await Notifications.cancelScheduledNotificationAsync(
                          cp1.Identifier
                        );
                      }
                      if (Object.keys(cp2).length !== 0) {
                        await Notifications.cancelScheduledNotificationAsync(
                          cp2.Identifier
                        );
                      }
                      if (Object.keys(cp3).length !== 0) {
                        await Notifications.cancelScheduledNotificationAsync(
                          cp3.Identifier
                        );
                      }
                      setSwitchOn(!switchOn);
                      dispatch(setCP1({}));
                      dispatch(setCP2({}));
                      dispatch(setCP3({}));
                      setShowCheckpoint2(false);
                      setShowCheckpoint3(false);
                      setCounter(2);
                    }}
                    color="#fa5d5d"
                  />
                </View>

                {switchOn && (
                  <View>
                    <List.Item
                      style={styles.item}
                      title="Checkpoint 1"
                      titleStyle={styles.title}
                      right={(props) => (
                        <View style={{ justifyContent: "center" }}>
                          <IconButton
                            {...props}
                            icon="close"
                            onPress={async () => {
                              if (Object.keys(cp1).length !== 0) {
                                await Notifications.cancelScheduledNotificationAsync(
                                  cp1.Identifier
                                );
                              }
                              if (showCheckpoint2 && showCheckpoint3) {
                                dispatch(setCP1(cp2));
                                dispatch(setCP2(cp3));
                                dispatch(setCP3({}));
                                setShowCheckpoint3(false);
                                setCounter(counter - 1);
                              } else if (showCheckpoint2) {
                                dispatch(setCP1(cp2));
                                dispatch(setCP2({}));
                                setShowCheckpoint2(false);
                                setCounter(counter - 1);
                              } else {
                                dispatch(setCP1({}));
                                setSwitchOn(false);
                              }
                            }}
                          />
                        </View>
                      )}
                      description="Create your action plan for Checkpoint 1"
                      descriptionStyle={styles.EndGoal}
                      onPress={() =>
                        navigation.navigate("Checkpoint 1", {
                          DateTimeFormatted: moment(dateTime).format(
                            "Do MMMM YYYY, h:mm a"
                          ),
                        })
                      }
                    />

                    {showCheckpoint2 && (
                      <List.Item
                        style={styles.item}
                        title="Checkpoint 2"
                        titleStyle={styles.title}
                        right={(props) => (
                          <View style={{ justifyContent: "center" }}>
                            <IconButton
                              {...props}
                              icon="close"
                              onPress={async () => {
                                if (Object.keys(cp2).length !== 0) {
                                  await Notifications.cancelScheduledNotificationAsync(
                                    cp2.Identifier
                                  );
                                }
                                if (showCheckpoint3) {
                                  dispatch(setCP2(cp3));
                                  dispatch(setCP3({}));
                                  setShowCheckpoint3(false);
                                  setCounter(counter - 1);
                                } else {
                                  dispatch(setCP2({}));
                                  setShowCheckpoint2(false);
                                  setCounter(counter - 1);
                                }
                              }}
                            />
                          </View>
                        )}
                        description="Create your action plan for Checkpoint 2"
                        descriptionStyle={styles.EndGoal}
                        onPress={() =>
                          navigation.navigate("Checkpoint 2", {
                            DateTimeFormatted: moment(dateTime).format(
                              "Do MMMM YYYY, h:mm a"
                            ),
                          })
                        }
                      />
                    )}

                    {showCheckpoint3 && (
                      <List.Item
                        style={styles.item}
                        title="Checkpoint 3"
                        titleStyle={styles.title}
                        right={(props) => (
                          <View style={{ justifyContent: "center" }}>
                            <IconButton
                              {...props}
                              icon="close"
                              onPress={async () => {
                                if (Object.keys(cp3).length !== 0) {
                                  await Notifications.cancelScheduledNotificationAsync(
                                    cp3.Identifier
                                  );
                                }
                                dispatch(setCP3({}));
                                setShowCheckpoint3(false);
                                setCounter(counter - 1);
                              }}
                            />
                          </View>
                        )}
                        description="Create your action plan for Checkpoint 3"
                        descriptionStyle={styles.EndGoal}
                        onPress={() =>
                          navigation.navigate("Checkpoint 3", {
                            DateTimeFormatted: moment(dateTime).format(
                              "Do MMMM YYYY, h:mm a"
                            ),
                          })
                        }
                      />
                    )}

                    <TouchableOpacity
                      style={styles.addCheckpoint}
                      onPress={() => {
                        if (counter === 2) {
                          setShowCheckpoint2(true);
                          setCounter(counter + 1);
                        } else if (counter === 3) {
                          setShowCheckpoint3(true);
                          setCounter(counter + 1);
                        }
                      }}
                    >
                      {counter <= 3 ? (
                        <View style={{ flexDirection: "row" }}>
                          <MaterialIcons
                            name="add-circle"
                            size={22}
                            color="#458c0b"
                          />
                          <Text style={styles.addCheckpointText}>
                            {" "}
                            Add another checkpoint{" "}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: "row" }}>
                          <Text
                            style={{
                              ...styles.addCheckpointText,
                              color: "#fa5d5d",
                            }}
                          >
                            {" "}
                            You have reached the limit of 3 checkpoints{" "}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          )}
        </Formik>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
    flex: 1,
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
  saveButton: {
    position: "absolute",
    right: 0,
  },
  saveText: {
    fontSize: 18,
    color: "crimson",
    opacity: 0.6,
    position: "absolute",
    right: 0,
  },
  saveTextAfterValidation: {
    fontSize: 18,
    color: "crimson",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  title: {
    alignSelf: "center",
    fontSize: 17,
    fontWeight: "bold",
  },
  EndGoal: {
    alignSelf: "center",
    fontSize: 14,
  },
  item: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.4,
    borderBottomColor: "#999",
    marginBottom: 3,
  },
  switch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: "#999",
    borderTopWidth: 0.4,
    borderBottomWidth: 0.4,
    borderBottomColor: "#999",
    paddingTop: 20,
    paddingBottom: 20,
  },
  addCheckpoint: {
    flexDirection: "row",
    alignSelf: "center",
  },
  addCheckpointText: {
    ...globalStyles.bodyText,
    color: "#458c0b",
    alignSelf: "center",
  },
});
