import { Select, Collapse, ConfigProvider } from "antd"; // Import ConfigProvider
import FlexContainer from "../components/FlexContainer";
import { useAppContext } from "../context/AppContext";
import { useEffect, useState } from "react";
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
  } = useAppContext();
  const [slotNames, setSlotNames] = useState([]);

  const submitSlot = async (slot) => {
    await fetchExamData(slots[slot], slot);
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
      label: "Today's Exams",
      children: (
        <div className="tcwrap">
          {examToday.map((exam, index) => (
            <div key={index} className="tcard">
              <img src="../book.svg" alt="hi" />
              <div className="cdet">
                <h3>{exam}</h3>
                <p>Slot {selectedSlotName}</p>
              </div>
            </div>
          ))}
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
        <br />
        <Collapse
          defaultActiveKey={[]}
          items={items}
          collapsible="header"
          style={{ width: "97%", margin: "0 auto" }} 
        />
      </>
    </ConfigProvider>
  );
};

export default TodayExam;