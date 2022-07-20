const url = "https://sugoku.herokuapp.com/board";
const BoxBoard = document.querySelector("#box");
var difficultyInput = document.querySelector(
  'input[name="difficulty-radio"]:checked'
).value;

var message = document.getElementById("message");

var DataFromApi = {
  board: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

var Solution = {
  board: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

//create board
for (let i = 0; i <= 80; i++) {
  inputBox = document.createElement("input");
  inputBox.setAttribute("type", "text");
  inputBox.setAttribute("id", `${i}`);
  inputBox.setAttribute("maxlength", "1");
  inputBox.setAttribute("pattern", "([1-9])");
  BoxBoard.appendChild(inputBox);
}

async function fetchApiData() {
  var fetchUrl = await fetch(url + `?difficulty=${difficultyInput}`);
  var response = await fetchUrl.json();
  DataFromApi = response;
  await FetchSolution();
  //remove css when changing board
  boardArray.forEach((element) => {
    element.removeAttribute("class");
  });
}

var boardArray = Array.from(BoxBoard.children);

var flatApiData = DataFromApi.board.flat();

async function PopulateBoard() {
  await fetchApiData();

  flatApiData = DataFromApi.board.flat();
  //console.log(flatApiData);

  for (let i = 0; i < boardArray.length; i++) {
    boardArray[i].value = flatApiData[i];

    if (boardArray[i].value == 0) {
      boardArray[i].value = "";
    }
    if (boardArray[i].value !== "") {
      boardArray[i].setAttribute("disabled", "disabled");
    } else if (!boardArray[i].value) {
      boardArray[i].removeAttribute("disabled");
    }
  }
}

var selectBoxes = document.querySelectorAll("input[type=text");

for (let i = 0; i < selectBoxes.length; i++) {
  var boxID = document.getElementById(`${i}`);

  boxID.addEventListener("input", function (e) {
    updateValue(e);
    convertArrayto2D();
    Validate();
  });

  function updateValue(e) {
    inputIndex = e.path[0].id;
    inputValue = e.target.value;
    inputSource = e.srcElement;
    //console.log(inputSource);

    flatApiData[i] = parseInt(inputValue);
    //console.log(flatApiData);
    //console.log(e);
  }
}

function convertArrayto2D() {
  DataFromApi.board = flatApiData.reduce(
    (cur, i) => {
      /* transform 1d array to 2d */
      let lastInd = cur.length - 1;
      let lastVal = cur[lastInd];

      if (lastVal.length === 9) {
        return cur.concat([[i]]);
      }
      return cur.slice(0, lastInd).concat([lastVal.concat(i)]);
    },
    [[]]
  );
}

function Validate() {
  for (let i = 0; i < DataFromApi.board.length; i++) {
    const set = new Set();
    for (let j = 0; j < DataFromApi.board[i].length; j++) {
      const cell = DataFromApi.board[i][j];
      if (cell == 0) continue;
      if (set.has(cell)) {
        inputSource.classList.add("invalid");
      } else set.add(cell);
    }
  }

  for (let i = 0; i < DataFromApi.board.length; i++) {
    const set = new Set();
    for (let j = 0; j < DataFromApi.board[i].length; j++) {
      const cell = DataFromApi.board[j][i];
      if (cell == 0) continue;
      if (set.has(cell)) {
        inputSource.classList.add("invalid");
      } else set.add(cell);
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const set = new Set();
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          const cell = DataFromApi.board[3 * i + k][3 * j + l];
          if (cell == 0) continue;
          if (set.has(cell)) {
            inputSource.classList.add("invalid");
          } else set.add(cell);
        }
      }
    }
  }
}

function clearInput() {
  selectBoxes.forEach((input) => {
    input.value = "";
    input.disabled = false;
    input.classList.remove("invalid");
  });
}

function Undo() {
  inputSource.value = "";
}

const encodeBoard = (board) =>
  board.reduce(
    (result, row, i) =>
      result +
      `%5B${encodeURIComponent(row)}%5D${i === board.length - 1 ? "" : "%2C"}`,
    ""
  );

const encodeParams = (params) =>
  Object.keys(params)
    .map((key) => key + "=" + `%5B${encodeBoard(params[key])}%5D`)
    .join("&");

var FlatSolution;
async function FetchSolution() {
  await fetch("https://sugoku.herokuapp.com/solve", {
    method: "POST",
    body: encodeParams(DataFromApi),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
    .then((response) => response.json())
    .then((response) => (Solution = response));
  console.log(Solution);
  FlatSolution = Solution.solution.flat();
  console.log(FlatSolution);
}

async function SolveButton() {
  //await FetchSolution();
  // Solution = solution.solution.flat();
  // SolutionFlat = solution.solution;
  // console.log(SolutionFlat);
  //SolutionFlat = Solution.solution.board.flat();

  for (let i = 0; i < boardArray.length; i++) {
    boardArray[i].value = FlatSolution[i];
  }
}

function ValidateButton() {
  //await FetchSolution();
  console.log(flatApiData)
  console.log(FlatSolution);
  function equal(solution, board) {
    if (!Array.isArray(solution) && !Array.isArray(board)) {
      return solution === board;
    }

    if (solution.length !== board.length) {
      return false;
  }

    for (var i = 0; i < solution; i++) {
      if (!equal(solution[i], board[i])) {
        return false;
      }
    }

    return true;
  }
  console.log(equal(FlatSolution, flatApiData))
  console.log(FlatSolution);
  console.log(flatApiData);

  if (equal(FlatSolution, flatApiData) === true) {
    message.innerHTML = "Congratulations";
    console.log("congrats");
    console.log(FlatSolution);
    console.log(flatApiData)
    //console.log(boardArray);
  } if (equal(FlatSolution, boardArray) === false) {
    message.innerHTML = "It is not solved";
  }
}
