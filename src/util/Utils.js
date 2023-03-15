export const mapOrder = (array, order, key) => {
  array.sort(function (a, b) {
    var A = a[key],
      B = b[key];
    if (order.indexOf(A + "") > order.indexOf(B + "")) {
      return 1;
    } else {
      return -1;
    }
  });
  return array;
};

export const getDateWithFormat = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return dd + "." + mm + "." + yyyy;
};

export const getCurrentTime = () => {
  const now = new Date();
  return now.getHours() + ":" + now.getMinutes();
};
export const getCurrentUser = () => {
  const userID = localStorage.getItem("user_id");
  switch (userID) {
    case "NYnE9NoeKiT08U05AmK2ijPpcvV2":
      //Sohayb Hassan
      return {
        name: "Sohayb Hassan",
        id: "NYnE9NoeKiT08U05AmK2ijPpcvV2",
        email: "sohaybmohammed@gmail.com",
      };
    case "N6t5EcEbiEPu7RX6SMTINFNRBlf1":
      //Anas Taher
      return {
        name: "Anas Taher",
        id: "N6t5EcEbiEPu7RX6SMTINFNRBlf1",
        email: "annastaher@gmail.com",
      };
    case "byN8fQxFkpaJJdi5OzfQhKywqiy2":
      //Moaz M.
      return {
        name: "Moaz M.",
        id: "byN8fQxFkpaJJdi5OzfQhKywqiy2",
        email: "moaz5an@gmail.com",
      };
    case "yRGROLqSIZUyj2DSujoqfvLCqVV2":
      //Gohary
      return {
        name: "Gohary",
        id: "yRGROLqSIZUyj2DSujoqfvLCqVV2",
        email: "gohary363@gmail.com",
      };
    case "ChzYvzJR0WhHn4dunrPiS26ir9q2":
      //Shokry
      return {
        name: "Shokry",
        id: "ChzYvzJR0WhHn4dunrPiS26ir9q2",
        email: "shokry@irideegypt.com",
      };
    case "L41uJRz4V2ZaYTbRnyJ0DfFEke72":
      //Tasnim
      return {
        name: "Tasnim",
        id: "L41uJRz4V2ZaYTbRnyJ0DfFEke72",
        email: "tasnim@irideegypt.com",
      };

    default:
      return {
        name: "Unknown",
        id: "AAAAA",
        email: "irideegypt@gmail.com",
      };
  }
};
export const getUserById = (userID) => {
  switch (userID) {
    case "NYnE9NoeKiT08U05AmK2ijPpcvV2":
      //Sohayb Hassan
      return {
        name: "Sohayb Hassan",
        id: "NYnE9NoeKiT08U05AmK2ijPpcvV2",
        email: "sohaybmohammed@gmail.com",
      };
    case "N6t5EcEbiEPu7RX6SMTINFNRBlf1":
      //Anas Taher
      return {
        name: "Anas Taher",
        id: "N6t5EcEbiEPu7RX6SMTINFNRBlf1",
        email: "annastaher@gmail.com",
      };
    case "byN8fQxFkpaJJdi5OzfQhKywqiy2":
      //Moaz M.
      return {
        name: "Moaz M.",
        id: "byN8fQxFkpaJJdi5OzfQhKywqiy2",
        email: "moaz5an@gmail.com",
      };
    case "yRGROLqSIZUyj2DSujoqfvLCqVV2":
      //Gohary
      return {
        name: "Gohary",
        id: "yRGROLqSIZUyj2DSujoqfvLCqVV2",
        email: "gohary363@gmail.com",
      };
      case "ChzYvzJR0WhHn4dunrPiS26ir9q2":
        //Shokry
        return {
          name: "Shokry",
          id: "ChzYvzJR0WhHn4dunrPiS26ir9q2",
          email: "shokry@irideegypt.com",
        };
      case "L41uJRz4V2ZaYTbRnyJ0DfFEke72":
          //Tasnim
          return {
            name: "Tasnim",
            id: "L41uJRz4V2ZaYTbRnyJ0DfFEke72",
            email: "tasnim@irideegypt.com",
          };
    default:
      return {
        name: "Unknown",
        id: "AAAAA",
        email: "irideegypt@gmail.com@gmail.com",
      };
  }
};
export const getUserByName = (userName) => {
  switch (userName) {
    case "Sohayb Hassan":
      //Sohayb Hassan
      return {
        name: "Sohayb Hassan",
        id: "NYnE9NoeKiT08U05AmK2ijPpcvV2",
        email: "sohaybmohammed@gmail.com",
      };
    case "Anas Taher":
      //Anas Taher
      return {
        name: "Anas Taher",
        id: "N6t5EcEbiEPu7RX6SMTINFNRBlf1",
        email: "annastaher@gmail.com",
      };
    case "Moaz M.":
      //Moaz M.
      return {
        name: "Moaz M.",
        id: "byN8fQxFkpaJJdi5OzfQhKywqiy2",
        email: "moaz5an@gmail.com",
      };
    case "Gohary":
      //Gohary
      return {
        name: "Gohary",
        id: "yRGROLqSIZUyj2DSujoqfvLCqVV2",
        email: "gohary363@gmail.com",
      };
      case "ChzYvzJR0WhHn4dunrPiS26ir9q2":
        //Shokry
        return {
          name: "Shokry",
          id: "ChzYvzJR0WhHn4dunrPiS26ir9q2",
          email: "shokry@irideegypt.com",
        };
        case "L41uJRz4V2ZaYTbRnyJ0DfFEke72":
          //Tasnim
          return {
            name: "Tasnim",
            id: "L41uJRz4V2ZaYTbRnyJ0DfFEke72",
            email: "tasnim@irideegypt.com",
          };
    default:
      return {
        name: "Unknown",
        id: "AAAAA",
        email: "irideegypt@gmail.com@gmail.com",
      };
  }
};

export const addCommas = (nStr) => {
  nStr += "";
  var x = nStr.split(".");
  var x1 = x[0];
  var x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
};
