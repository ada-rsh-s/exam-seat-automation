import React, { useEffect, useState } from "react";
import {
  Collapse,
  ConfigProvider,
  Select,
  Modal,
  Button,
  Popconfirm,
} from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { useAppContext } from "../context/AppContext";
import { test } from "../utils/seatAllocator";

const TodayExam = () => {
  const {
    fetchExamData,
    fetchslotNames,
    slots,
    classCapacity,
    deptStrength,
    letStrength,
    exams,
    drop,
    rejoin,
    examToday,
    setAllocatedData,
    selectedSlotName,
    deptView,
    seatingExists,
    deleteAllocatedSlot,
  } = useAppContext();

  const [slotNames, setSlotNames] = useState([]);
  const [savedClasses, setSavedClasses] = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [slotChanged, setSlotChanged] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [cancelButtonDisabled, setCancelButtonDisabled] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const checkSlot = async (slot) => {
    const seatExists = await seatingExists(slot);
    if (seatExists) {
      setCurrentSlot(slot);
      setIsModalVisible(true);
    } else {
      submitSlot(slot, false);
    }
  };

  const submitSlot = async (slot, slotExists) => {
    setIsModalVisible(false);
    if (selectedSlotName === slot) {
      setSlotChanged(false);
    } else {
      setSlotChanged(true);
      const data = await fetchExamData(
        slots[slot],
        slot,
        selectedSlotName,
        slotExists
      );

      if (data !== undefined) {
        setSavedClasses(data.savedClasses);
        setSavedData(data.savedData);
      } else {
        setSavedClasses([]);
        setSavedData([]);
      }
    }
  };

  const deleteSlot = async () => {
    await deleteAllocatedSlot(selectedSlotName);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  useEffect(() => {
    if (
      classCapacity &&
      deptStrength &&
      letStrength &&
      exams &&
      drop &&
      rejoin &&
      examToday &&
      selectedSlotName
    ) {
      if (slotChanged && savedClasses !== null && savedData !== null) {
        try {
          const allocatedData = test(
            classCapacity,
            deptStrength,
            letStrength,
            exams,
            drop,
            rejoin,
            examToday,
            savedClasses,
            savedData
          );

          setSavedClasses(null);
          setSavedData(null);
          setAllocatedData(allocatedData, selectedSlotName);
        } catch (e) {
          console.log(e);
          setAllocatedData(undefined);
        }
      }
    }
  }, [
    classCapacity,
    deptStrength,
    letStrength,
    exams,
    drop,
    rejoin,
    examToday,
    selectedSlotName,
    savedClasses,
    savedData,
  ]);

  useEffect(() => {
    fetchslotNames().then((fetchedSlotNames) => {
      setSlotNames(fetchedSlotNames);
    });
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      // Reset countdown when modal is shown
      setCountdown(5);
      setCancelButtonDisabled(true);

      const intervalId = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            setCancelButtonDisabled(false);
            clearInterval(intervalId); // Stop the interval when countdown finishes
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId); // Cleanup on modal close
    }
  }, [isModalVisible]); // Re-run when the modal visibility changes

  const items = [
    {
      key: "1",
      label: "Exam list",
      children: (
        <div className="todayContainer">
          <center>
            {selectedSlotName && <h2>Slot {selectedSlotName}</h2>}
            <div className="tcwrap">
              {examToday &&
                examToday.map((exam, index) => (
                  <div key={index} className="tcard">
                    <img src="../book.svg" alt="hi" />
                    <div className="cdet">
                      <h3>{exam}</h3>
                    </div>
                  </div>
                ))}
            </div>
          </center>
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "#f0f9ff",
        },
      }}
    >
      <center>
        <label htmlFor="slot-select">Select Slot: </label>
        <Select
          id="slot-select"
          defaultValue={selectedSlotName}
          value={selectedSlotName}
          style={{
            width: 250,
            borderColor: "#f0f9ff",
          }}
          placeholder="Select Slot"
          onChange={checkSlot}
          options={slotNames.map((slot) => ({
            value: slot,
            label: slot,
          }))}
          dropdownStyle={{
            backgroundColor: "#f0f9ff",
          }}
        />
        &nbsp;&nbsp;
        {selectedSlotName && (
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={deleteSlot}
            okText="Yes"
            cancelText="No"
          >
            <Button color="danger" variant="dashed">
              Delete
            </Button>
          </Popconfirm>
        )}
      </center>
      {Object.keys(deptView).length !== 0 && (
        <>
          <h3 className="tdhd">Today's Exam</h3>
          <div className="underline"></div>
          <Collapse
            defaultActiveKey={[]}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            items={items}
            collapsible="header"
            style={{
              width: "97%",
              margin: "0 auto",
              background: "#f0f9ff",
            }}
          />
        </>
      )}
      <Modal
        title="Seating exists! Create a new one?"
        open={isModalVisible}
        onOk={() => submitSlot(currentSlot, true)} // Triggered when "Use Existing" is clicked
        closable={false} // Remove the close (X) button
        maskClosable={false}
        okButtonProps={{
          style: {
            backgroundColor: "#ffff",
            borderColor: "red",
            color: "red",
          },
        }}
        cancelButtonProps={{
          style: {
            backgroundColor: cancelButtonDisabled ? "#b5b5b5" : "#55c2da", // Disable color
            borderColor: cancelButtonDisabled ? "#b5b5b5" : "#55c2da",
            color: cancelButtonDisabled ? "#888" : "white",
          },
          disabled: cancelButtonDisabled, // Ensure the button is fully disabled and not clickable
        }}
        okText="Use Existing"
        cancelText={
          cancelButtonDisabled
            ? `Yes, create new (${countdown}s)`
            : "Yes, create new"
        }
        onCancel={() => submitSlot(currentSlot, false)} // Trigger when clicking "Yes, create new"
      >
        <div style={{ textAlign: "right" }}>
          <Button
            onClick={() => setIsModalVisible(false)} // Close the modal manually
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "#F0F8FF",
              border: "none",
              borderRadius: "50%",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            X
          </Button>
        </div>
        {/* Modal content */}
      </Modal>
    </ConfigProvider>
  );
};

export default TodayExam;
