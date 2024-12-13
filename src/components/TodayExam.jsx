import { Collapse, ConfigProvider, Select } from "antd";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { test } from "../utils/seatAllocator";
import { CaretRightOutlined } from "@ant-design/icons";
import { Button } from "antd/es";
import confirm from "antd/es/modal/confirm";
import { ExclamationCircleFilled } from "@ant-design/icons/lib";
import { Popconfirm } from "antd";

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

  const checkSlot = async (slot) => {
    const seatExists = await seatingExists(slot);
    if (seatExists) showConfirm(slot);
    else submitSlot(slot, false);
  };

  const submitSlot = async (slot, slotExists) => {
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
          setAllocatedData(undefined);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
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

  const showConfirm = (slot) => {
    confirm({
      title: "Seating exists! Create a new one?",
      icon: <ExclamationCircleFilled />,
      okText: "Use Existing",
      cancelText: "Yes, create new",
      okCancel: true,
      autoFocusButton:null,
      okButtonProps: {
        style: {
          backgroundColor: "#ffff",
          borderColor: "red",
          color: "red",
        }, // Customize the button
      },
      cancelButtonProps: {
        style: {
          backgroundColor: "#55c2da",
          borderColor: "#55c2da",
          color: "white",
        },
      },
      onOk() {
        submitSlot(slot, true);
      },
      onCancel() {
        submitSlot(slot, false);
      },
    });
  };

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
      </>
    </ConfigProvider>
  );
};

export default TodayExam;
