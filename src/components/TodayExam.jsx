import { Collapse, ConfigProvider, Select } from "antd";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { test } from "../utils/seatAllocator";
import { CaretRightOutlined } from "@ant-design/icons";

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
  } = useAppContext();
  const [slotNames, setSlotNames] = useState([]);
  const [slotChanged, setSlotChanged] = useState(false);

  const submitSlot = async (slot) => {
    if (selectedSlotName === slot) {
      setSlotChanged(false);
    } else {
      setSlotChanged(true);
      await fetchExamData(slots[slot], slot, selectedSlotName);
    }
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
      if (slotChanged) {
        try {
          const allocatedData = test(
            classCapacity,
            deptStrength,
            letStrength,
            exams,
            drop,
            rejoin,
            examToday,
            selectedSlotName
          );
          setAllocatedData(allocatedData);
        } catch (e) {
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
  ]);

  useEffect(() => {
    fetchslotNames().then((fetchedSlotNames) => {
      setSlotNames(fetchedSlotNames);
    });
  }, []);

  const items = [
    {
      key: "1",
      label: "Exam list",
      children: (
        <div className="todayContainer">
          {" "}
          <center>
            {" "}
            {selectedSlotName && <h2>Slot {selectedSlotName}</h2>}
            <div className="tcwrap">
              {examToday && examToday.map((exam, index) => (
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
      <>
        <center>
          <label htmlFor="slot-select">Select Slot : </label>
          <Select
            id="slot-select"
            defaultValue={selectedSlotName}
            value={selectedSlotName}
            style={{
              width: 250,
              borderColor: "#f0f9ff",
            }}
            placeholder="Select Slot"
            onChange={submitSlot}
            options={slotNames.map((slot) => ({
              value: slot,
              label: slot,
            }))}
            dropdownStyle={{
              backgroundColor: "#f0f9ff",
            }}
          />
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
      </>
    </ConfigProvider>
  );
};

export default TodayExam;
