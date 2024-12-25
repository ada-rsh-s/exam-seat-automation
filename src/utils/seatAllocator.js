import _ from "lodash";
export const test = (
  classCapacity,
  deptStrength,
  letStrength,
  exams,
  drop,
  rejoin,
  examToday,
  savedClasses,
  savedData
) => {
  let sup = {};

  for (let key of Object.keys(exams)) {
    exams[key] = exams[key].filter((exam) => examToday.includes(exam));
  }

  Object.keys(sup).forEach((key) => {
    exams[`SUP_${key}`] = [key];
  });

  Object.keys(sup).forEach((key) => {
    deptStrength[`SUP_${key}`] = sup[key].length;
  });

  function mergeExamSchedules(exams) {
    let updatedExams = {};
    for (let key in exams) {
      let mergedExams = new Set(exams[key]);
      for (let otherKey in exams) {
        if (key !== otherKey) {
          exams[key].forEach((exam) => {
            if (exams[otherKey].includes(exam)) {
              exams[otherKey].forEach((otherExam) =>
                mergedExams.add(otherExam)
              );
            }
          });
        }
      }
      updatedExams[key] = Array.from(mergedExams);
    }
    if (_.isEqual(updatedExams, exams) == false)
      return mergeExamSchedules(updatedExams);
    else return updatedExams;
  }

  exams = mergeExamSchedules(exams, sup);
   
  let classes = [],
    lastIndex = 0,
    data = [],
    supIndex = 0;

  const updateDeptStrength = (deptStrength, letStrength) => {
    const updatedDeptStrength = {};
    for (const dept in deptStrength) {
      const rejoinStrength = rejoin[dept] ? rejoin[dept].length : 0;
      updatedDeptStrength[dept] =
        deptStrength[dept] + (letStrength[dept] || 0) + rejoinStrength;
    }
    return updatedDeptStrength;
  };

  deptStrength = updateDeptStrength(deptStrength, letStrength);

  classCapacity = Object.entries(classCapacity)
    .sort(([keyA, a], [keyB, b]) => {
      const strengthA = a[0] * a[1]; // Calculate strength for entry A
      const strengthB = b[0] * b[1]; // Calculate strength for entry B

      if (strengthA === strengthB) {
        return keyA.localeCompare(keyB); // If strengths are equal, sort by key
      }

      return strengthB - strengthA; // Sort by strength (descending)
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  let classNames = Object.keys(classCapacity);

  for (let i = 0; i < classNames.length; i++) {
    const [rows, cols] = classCapacity[classNames[i]];
    classes[i] = Array(rows)
      .fill()
      .map(() => Array(cols).fill(0));
  }

  //to calculate strength of odd/even indices
  function strengthCalculator(n, data) {
    let strength = 0;

    for (let i = n; i < data.length; i += 2) {
      strength += data[i][1];
    }

    return strength;
  }

  //for efficient grouping of departments
  function optimizer(resultArray, n) {
    for (const key in resultArray) {
      const subArray = resultArray[key];
      if (subArray.length > n && n == 1) {
        continue;
      }
      const evenStrength = strengthCalculator(0, data);
      const oddStrength = strengthCalculator(1, data);
      if (subArray.length >= n) {
        let sub;
        if (n === 1) {
          sub = [subArray[0]];
        } else {
          sub = [subArray[0], ["DUM", 0], subArray[1]];
          if (subArray.length > n) {
            for (let j = 2; j < subArray.length; j++) {
              sub = sub.concat([["DUM", 0], subArray[j]]);
            }
          }
        }
        if (evenStrength > oddStrength) {
          if (lastIndex % 2 !== 0) {
            data = data.concat(sub);
            lastIndex++;
          } else {
            data = data.concat([["DUM", 0]], sub);
          }
        } else {
          if (lastIndex % 2 === 0) {
            data = data.concat(sub);
            lastIndex++;
          } else {
            data = data.concat([["DUM", 0]], sub);
          }
        }
      }
    }
  }

  //sorting of the resultArray
  function arrayStrength(array) {
    let total = 0;
    for (let i = 0; i < array[1].length; i++) {
      total += array[1][i][1];
    }
    return total;
  }

  function arraySorter(resultArray) {
    let resultArrayEntries = Object.entries(resultArray);

    for (let i = 1; i < resultArrayEntries.length; i++) {
      let key = resultArrayEntries[i];
      let j = i - 1;
      while (
        j >= 0 &&
        arrayStrength(resultArrayEntries[j]) < arrayStrength(key)
      ) {
        resultArrayEntries[j + 1] = resultArrayEntries[j];
        j = j - 1;
      }
      resultArrayEntries[j + 1] = key;
    }
    const finalResultArray = Object.fromEntries(resultArrayEntries);
    
    return finalResultArray;
  }

  function dataArrayMaker(examToday, exams, deptStrength) {
    const resultArray = {};

    const deptList = Object.keys(exams);
    const subList = Object.values(exams);

    const deptSet = new Set();

    examToday.forEach((exam) => {
      let subArray = [];
      deptList.forEach((dept, index) => {
        if (subList[index].includes(exam)) {
          const num = deptStrength[dept];
          if (!deptSet.has(dept)) {
            subArray.push([dept, num]);
            deptSet.add(dept);
          }
        }
      });

      if (subArray.length > 0) {
        resultArray[exam] = subArray;
      }
    });

    Object.keys(resultArray).forEach((key) => {
      if (resultArray[key].length === 0) {
        delete resultArray[key];
      }
    });
    
    optimizer(arraySorter(resultArray), 2);
    optimizer(arraySorter(resultArray), 1);
    return data;
  }

  if (savedData.length === 0)
    data = dataArrayMaker(examToday, exams, deptStrength);
  else data = savedData;

  let evenBenchIndex = 0;
  let oddBenchIndex = 1;
  let evenRowIndex = 0;
  let oddRowIndex = 0;
  let evenClassIndex = 0;
  let oddClassIndex = 0;
  let supRollNum = [];

  function formatToThreeDigits(number) {
    return number.toString().padStart(3, "0");
  }

  const seatArr = (n, sub, b1) => {
    if (n === 0) return;
    let num = 1;
    let benchIndex = b1 % 2 === 0 ? evenBenchIndex : oddBenchIndex;
    let rowIndex = b1 % 2 === 0 ? evenRowIndex : oddRowIndex;
    let classIndex = b1 % 2 === 0 ? evenClassIndex : oddClassIndex;
    if (sub.includes("SUP")) {
      const supSub = sub.substring(4);
      supRollNum = sup[supSub];
    }
    const rejoinDept = Object.keys(rejoin);
    let rejoinLength = 0,
      rejoinIndex = 0;

    let rejoinList;
    let rejoinStr;
    if (rejoinDept.includes(sub)) {
      rejoinList = rejoin[sub];
      rejoinLength = rejoinList.length;
      rejoinStr = n - rejoinLength;
    }
    for (let Class = classIndex; Class < classes.length; Class++) {
      const currentClass = classes[Class];
      for (let j = benchIndex; j < currentClass[0].length; j += 2) {
        for (let i = rowIndex; i < currentClass.length; i++) {
          let flag = true;
          if (sub.includes("SUP")) {
            currentClass[i][j] = supRollNum[supIndex];
            supIndex++;
            if (n === supIndex) {
              supIndex = 0;
              num = n;
            }
          } else if (
            rejoinDept.includes(sub) &&
            n - (rejoinLength - 1) === num
          ) {
            currentClass[i][j] = rejoinList[rejoinIndex];
            rejoinIndex++;
            rejoinLength--;
            if (rejoinLength === 0) {
              num = n;
            }
          } else {
            let sNum = formatToThreeDigits(num);
            while (
              drop.includes("JEC" + sub.concat(sNum)) ||
              drop.includes("LJEC" + sub.concat(sNum))
            ) {
              num++;
              sNum = formatToThreeDigits(num);
            }
            if (num <= deptStrength[sub] - (letStrength[sub] + rejoinLength)) {
              currentClass[i][j] = "JEC" + sub.concat(sNum);
            } else {
              currentClass[i][j] = "LJEC" + sub.concat(sNum);
            }
            if (num > n) {
              num--;
            }
          }
          if (num === n) {
            let n1, n2;
            if (currentClass[0].length % 2 === 0) {
              n1 = 2;
              n2 = 1;
            } else {
              n1 = 1;
              n2 = 2;
            }
            if (i === currentClass.length - 1 && b1 % 2 === 0) {
              evenRowIndex = 0;
              evenBenchIndex = j + 2;

              if (
                currentClass[currentClass.length - 1][
                  currentClass[0].length - n1
                ] !== 0
              ) {
                evenClassIndex = Class + 1;
                evenRowIndex = 0;
                evenBenchIndex = 0;
              } else {
                evenClassIndex = Class;
              }
              return;
            }
            if (i === currentClass.length - 1 && b1 % 2 !== 0) {
              oddRowIndex = 0;
              oddBenchIndex = j + 2;
              if (
                currentClass[currentClass.length - 1][
                  currentClass[0].length - n2
                ] !== 0
              ) {
                oddClassIndex = Class + 1;
                oddRowIndex = 0;
                oddBenchIndex = 1;
              } else {
                oddClassIndex = Class;
              }
              return;
            }
            if (b1 % 2 === 0) {
              evenRowIndex = i + 1;
              evenBenchIndex = j;
              evenClassIndex = Class;
            } else {
              oddRowIndex = i + 1;
              oddBenchIndex = j;
              oddClassIndex = Class;
            }
            return;
          }

          if (i === currentClass.length - 1) {
            benchIndex = b1 % 2 === 0 ? 0 : 1;
            rowIndex = 0;
          }
          num++;
        }
      }
    }
  };

  if (savedClasses.length === 0) {
    let subjectAllotedNum = 0;
    for (const [dept, num] of data) {
      dept, num;
      if (subjectAllotedNum % 2 === 0) {
        seatArr(num, dept, 0);
      } else {
        seatArr(num, dept, 1);
      }
      subjectAllotedNum++;
    }
  } else {
    classes = savedClasses;
  }

  const consolidateItems = (items) => {
    const groupedItems = {};

    items.forEach((item) => {
      if (item != 0) {
        const [prefix, num] = item
          .match(/^([A-Z]{3,4}\d{2}[A-Z]{2})(\d{3})$/)
          .slice(1);
        if (Object.values(rejoin).some((value) => value.includes(item))) {
          const prefixrejoin = prefix + "R";
          if (!groupedItems[prefixrejoin]) groupedItems[prefixrejoin] = [];
          groupedItems[prefixrejoin].push(Number(num));
        } else {
          if (!groupedItems[prefix]) groupedItems[prefix] = [];
          groupedItems[prefix].push(Number(num));
        }
      }
    });

    return Object.entries(groupedItems).flatMap(([prefix, nums]) => {
      nums.sort((a, b) => a - b);
      let first, last;

      const rejoinList = !/\d/.test(prefix.slice(-3));

      if (rejoinList) {
        first = `${prefix.slice(0, -1)}${formatToThreeDigits(nums[0])}`;
        last = `${prefix.slice(0, -1)}${formatToThreeDigits(
          nums[nums.length - 1]
        )}`;
      } else {
        first = `${prefix}${formatToThreeDigits(nums[0])}`;
        last = `${prefix}${formatToThreeDigits(nums[nums.length - 1])}`;
      }
      return [first, last];
    });
  };
  
  const calculateCounts = (items, sup) => {
    const counts = [];

    for (let i = 1; i < items.length; i += 2) {
      const num1 = parseInt(items[i].slice(-3));
      const num0 = parseInt(items[i - 1].slice(-3));
      const match = items[i].match(/^L?JEC(\d{2})([A-Z]{2})\d{3}$/);
      let dropCount = 0,
        supCount = 0;
      let flag = false;
      const supArray = Object.values(sup).flat();

      let result;
      if (match) {
        result = `${match[1]}${match[2]}`;
        for (let j = num0; j < num1; j++) {
          if (
            drop.includes("JEC" + result + formatToThreeDigits(j)) ||
            drop.includes("LJEC" + result + formatToThreeDigits(j))
          ) {
            flag = true;
            dropCount++;
          }
          if (
            supArray.includes("JEC" + result + formatToThreeDigits(j)) ||
            supArray.includes("LJEC" + result + formatToThreeDigits(j))
          ) {
            supCount++;
          }
        }
        if (!flag) {
          if (supCount == 0) {
            counts.push(num1 - num0 + 1);
          } else {
            counts.push(supCount + 1);
            supCount = 0;
          }
        } else {
          let inRejoinAndDrop = false;
          const rejoinKey = Object.keys(rejoin).find((key) =>
            rejoin[key].includes("JEC" + result + formatToThreeDigits(num1))
          );
          if (
            rejoinKey &&
            rejoin[rejoinKey].some((item) => drop.includes(item))
          ) {
            inRejoinAndDrop = true;
          }

          if (inRejoinAndDrop && rejoinKey !== result) {
            counts.push(dropCount);
          } else {
            counts.push(num1 - num0 + 1 - dropCount);
          }

          dropCount = 0;
        }
      }
    }

    return counts;
  };

  const noticeBoardView = classes
    .map((cls, idx) => {
      const allItems = cls.flat();
      const consolidatedItems = consolidateItems(allItems);
      const counts = calculateCounts(consolidatedItems, sup);

      if (consolidatedItems.length > 0) {
        return {
          class: classNames[idx],
          items: consolidatedItems,
          count: counts,
          index: idx,
        };
      }
      return null;
    })
    .filter(Boolean);

  const extractDepartmentYear = (rollNo) => {
    const match = rollNo.match(/L?JEC(\d{2})([A-Z]{2})/);
    return match ? `${match[1]}${match[2]}` : null;
  };

  const organizeByDept = (data) => {
    const deptMap = {};

    data.forEach(({ class: room, items }) => {
      items.forEach((rollNo) => {
        let deptYear = extractDepartmentYear(rollNo);
        if (!deptYear) return;

        // Check if rollNo is in any keys of rejoin object
        let rejoinKey = Object.keys(rejoin).find((key) =>
          rejoin[key].includes(rollNo)
        );
        if (rejoinKey) {
          deptYear = rejoinKey;
        }

        if (!deptMap[deptYear]) {
          deptMap[deptYear] = [];
        }

        deptMap[deptYear].push({ room, rollNo });
      });
    });

    const result = Object.keys(deptMap).map((deptYear) => {
      const rooms = [];
      const rollNums = [];

      for (let i = 0; i < deptMap[deptYear].length; i += 2) {
        const { room: room1, rollNo: rollNo1 } = deptMap[deptYear][i];
        const { room: room2, rollNo: rollNo2 } = deptMap[deptYear][i + 1] || {};

        rooms.push(room1);
        rollNums.push(rollNo1, rollNo2);
      }

      const counts = calculateCounts(rollNums, sup);

      return {
        dept: deptYear,
        rooms,
        rollNums,
        count: counts,
      };
    });

    // Sort the results
    result.sort((a, b) => {
      const yearA = parseInt(a.dept.match(/\d+/)[0]);
      const yearB = parseInt(b.dept.match(/\d+/)[0]);

      const deptA = a.dept.match(/[A-Z]+/)[0];
      const deptB = b.dept.match(/[A-Z]+/)[0];

      if (yearA < yearB) return -1;
      if (yearA > yearB) return 1;

      if (deptA < deptB) return -1;
      if (deptA > deptB) return 1;

      return 0;
    });

    // Add continuous index based on count array length
    let currentIndex = 0;
    result.forEach((item) => {
      item.indexes = [];
      item.count.forEach(() => {
        item.indexes.push(currentIndex);
        currentIndex++;
      });
    });

    return result;
  };

  const deptView = organizeByDept(noticeBoardView);

  const classroomViewMaker = (data) => {
    const numRows = data.length;
    const numCols = data[0].length;

    let aCounter = 1;
    let bCounter = 1;

    const updatedData = Array.from({ length: numRows }, () =>
      Array(numCols * 2 - 1)
    );

    for (let col = 0; col < numCols; col++) {
      for (let row = 0; row < numRows; row++) {
        const labelPrefix = col % 2 === 0 ? "A" : "B";
        const labelNumber = col % 2 === 0 ? aCounter++ : bCounter++;
        const label = `${labelPrefix}${labelNumber}`;
        updatedData[row][col * 2] = label;
        updatedData[row][col * 2 + 1] = data[row][col];
      }
    }

    return updatedData;
  };

  const attendanceSheet = (deptView) => {
    const sortedClasses = classes.map((classGroup) => {
      return classGroup.flat().sort();
    });

    const result = [];

    deptView.forEach((dept) => {
      dept.rooms.forEach((room) => {
        let i = 1;
        const classIndex = classNames.indexOf(room);

        const classGroup = sortedClasses[classIndex]
          .filter((item) => {
            if (item === 0) return null;
            return item.includes(dept.dept);
          })
          .concat(
            sortedClasses[classIndex].filter((item) => {
              if (item === 0) return null;
              return rejoin[dept.dept] && rejoin[dept.dept].includes(item);
            })
          )
          .map((item) => ({
            slNo: i++,
            deptRoom: dept.dept + room,
            regNo: item,
          }));

        result.push(classGroup);
      });
    });

    return result;
  };

  const attendanceView = attendanceSheet(deptView);

  const classroomView = classes.map((cls) => {
    return classroomViewMaker(cls);
  });
  console.log(classCapacity);
  
  return [
    noticeBoardView,
    deptView,
    classroomView,
    attendanceView,
    classNames,
    classes,
    data,
  ];
};
