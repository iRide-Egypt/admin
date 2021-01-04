import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { getDateWithFormat } from "Util/Utils";

import { TODO_GET_LIST, TODO_ADD_ITEM } from "Constants/actionTypes";

import {
  getTodoListSuccess,
  getTodoListError,
  addTodoItemSuccess,
  addTodoItemError
} from "./actions";

// import todoData from "Data/todos.json";
import { db } from "../../firebase";
import firebase from "firebase";

const docRef = db.collection("app").doc("todo");

let todoData = [];

const getTodoListRequest = async () => {
  await docRef
    .get()
    .then(function (doc) {
      if (doc.exists) {
        console.log(doc.data().todos);
        todoData = doc.data().todos.reverse();
      } else {
        console.log("No such document!");
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });

  return await new Promise((success, fail) => {
    success(todoData);
  })
    .then((response) => response)
    .catch((error) => error);
};

function* getTodoListItems() {
  try {
    const response = yield call(getTodoListRequest);
    yield put(getTodoListSuccess(response));
  } catch (error) {
    yield put(getTodoListError(error));
  }
}

const addTodoItemRequest = async (item) => {
  let items = todoData;
  item.id = (items.length + 1).toString();
  item.createDate = getDateWithFormat();
  items.splice(0, 0, item);
  // console.log("item:",item)

  return await new Promise((success, fail) => {
    docRef
      .update({
        todos: firebase.firestore.FieldValue.arrayUnion(item),
      })
      .then((e) => {
        success(items);
      })
      .catch((err) => {
        return err;
      });
  })
    .then((response) => response)
    .catch((error) => error);
};

function* addTodoItem({ payload }) {
  try {
    const response = yield call(addTodoItemRequest, payload);
    yield put(addTodoItemSuccess(response));
  } catch (error) {
    yield put(addTodoItemError(error));
  }
}

export function* watchGetList() {
  yield takeEvery(TODO_GET_LIST, getTodoListItems);
}

export function* wathcAddItem() {
  yield takeEvery(TODO_ADD_ITEM, addTodoItem);
}


export default function* rootSaga() {
  yield all([fork(watchGetList), fork(wathcAddItem)]);
}
