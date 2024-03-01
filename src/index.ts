// Importing necessary modules from the 'azle' library and 'uuid' library
import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// Defining record types for different entities
type User = Record<{
  id: string;
  name: string;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

//user info record
type UserInfo = Record<{
  id: string;
  age: string;
  weight: string;
  height: string;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

type Workout = Record<{
  id: string;
  workoutType: string;
  number_of_reps: string;
  calories_burned: string;
  distance_covered: string;
  date: string;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;
//food diary
type FoodIntake = Record<{
  id: string;
  type_of_food: string;
  portion_size: string;
  number_of_calories: string;
  water_intake: string;
  created_date: nat64;
  updated_at: Opt<nat64>;
}>;

type UserInfoPayload = Record<{
  age: string;
  weight: string;
  height: string;
}>;
// type FoodDiary = Record<{
//   id: string;
//   entry: string;
//    created_date: nat64;
// }>

// type WeightPayload = Record<{
//   weight: string;
// }>;
// type HeightPayload = Record<{
//   height: string;
// }>;
type WorkoutPayload = Record<{
  workoutType: string;
  number_of_reps: string;
  calories_burned: string;
  distance_covered: string;
  date: string;
}>;

type FoodIntakePayload = Record<{
  type_of_food: string;
  portion_size: string;
  number_of_calories: string;
  water_intake: string;
}>;

// Creating instances of StableBTreeMap for each entity type
const userStorage = new StableBTreeMap<string, User>(0, 44, 512);
const userInfoStorage = new StableBTreeMap<string, UserInfo>(1, 44, 512);
const workOutStorage = new StableBTreeMap<string, Workout>(2, 44, 512);

const foodIntakeStorage = new StableBTreeMap<string, FoodIntake>(3, 44, 512);

//function to initialize user
$update;
export function initializeUser(name: string): Result<User, string> {
  if (!name) {
    return Result.Err<User, string>("Invalid");
  }
  try {
    const newUser: User = {
      id: uuidv4(),
      name: name,
      created_date: ic.time(),
      updated_at: Opt.None,
    };
    userStorage.insert(newUser.id, newUser);
    return Result.Ok(newUser);
  } catch (error) {
    return Result.Err<User, string>("Error while adding user");
  }
}
//function to add user info 
$update;
export function addUserInfo(
  id: string,
  payload: UserInfoPayload
): Result<UserInfo, string> {
  return match(userStorage.get(id), {
    Some: (user) => {
      const newUserInfo: UserInfo = {
        id: user.id,
        age: payload.age,
        weight: payload.weight,
        height: payload.height,
        createdAt: ic.time(),
        updatedAt: Opt.None,
      };
      userInfoStorage.insert(newUserInfo.id, newUserInfo);
      return Result.Ok<UserInfo, string>(newUserInfo);
    },
    None: () => Result.Err<UserInfo, string>(`Invalid ID: User does not exist`),
  });
}

//function to get user info
$query;
export function getUserInfo(id: string): Result<UserInfo, string> {
  return match(userInfoStorage.get(id), {
    Some: (userInfo) => Result.Ok<UserInfo, string>(userInfo),
    None: () => Result.Err<UserInfo, string>(`Invalid ID: User does not exist`),
  });
}

$update;
//function to update user info
export function updateUserInfo(
  id: string,
  payload: UserInfoPayload
): Result<UserInfo, string> {
  return match(userInfoStorage.get(id), {
    Some: (user) => {
      const updateUserInfo: UserInfo = {
        ...user,
        ...payload,
        updatedAt: Opt.Some(ic.time()),
      };
      userInfoStorage.insert(user.id, updateUserInfo);
      return Result.Ok<UserInfo, string>(updateUserInfo);
    },
    None: () => Result.Err<UserInfo, string>(`Invalid ID: User does not exist`),
  });
}

 //Create a new Workout
 $update;
 export function addWorkout(payload: WorkoutPayload): Result<Workout, string> {
   if (!payload.workoutType) {
     return Result.Err<Workout, string>("Invalid");
   }
   try {
     const newWorkout: Workout = {
       id: uuidv4(),
       workoutType: payload.workoutType,
       number_of_reps: payload.number_of_reps || "0",
       calories_burned: payload.calories_burned,
       distance_covered: payload.distance_covered || "0",
      date: payload.date,
      createdAt: ic.time(),
      updatedAt: Opt.None,
    };
    workOutStorage.insert(newWorkout.id, newWorkout);
    return Result.Ok(newWorkout);
  } catch (error) {
    return Result.Err<Workout, string>(
      "Problem occured while adding new workout"
    );
  }
}
 

//update Workout
$update;
export function updateWorkout(
  id: string,
  payload: WorkoutPayload
): Result<Workout, string> {
  return match(workOutStorage.get(id), {
    Some: (workout) => {
      const updateWorkout: Workout = {
        ...workout,
        ...payload,
        updatedAt: Opt.Some(ic.time()),
      };
      workOutStorage.insert(workout.id, updateWorkout);
      return Result.Ok<Workout, string>(updateWorkout);
    },
    None: () => Result.Err<Workout, string>(`Invalid ID:${id} does not exist`),
  });
}
//get all workouts
$query;
export function getAllWorkouts(): Vec<Workout> {
  return workOutStorage.values();
}

$query; //function to get workout by id
export function getWorkoutById(id: string): Result<Workout, string> {
  return match(workOutStorage.get(id), {
    Some: (workout) => Result.Ok<Workout, string>(workout),
    None: () => Result.Err<Workout, string>(`Invalid ID:${id} does not exist`),
  });
}

//function to search for workout by name
$query;
export function searchWorkoutByName(name: string): Vec<Workout> {
  return workOutStorage.values().filter((workout) =>
    workout.workoutType.toLowerCase().includes(name.toLowerCase())
  );
}


$update; //function to delete workout
export function deleteWorkout(id: string): Result<Workout, string> {
  return match(workOutStorage.get(id), {
    Some: (workout) => {
      workOutStorage.remove(id);
      return Result.Ok<Workout, string>(workout);
    },
    None: () => Result.Err<Workout, string>("This Workout Does not exist"),
  });
}

$update; //Create a new Food Intake
export function addFoodIntake(
  payload: FoodIntakePayload
): Result<FoodIntake, string> {
  if (
    !payload.type_of_food ||
    !payload.portion_size ||
    !payload.number_of_calories
  ) {
    return Result.Err<FoodIntake, string>("Invalid");
  }
  try {
    const newFoodIntake: FoodIntake = {
      id: uuidv4(),
      type_of_food: payload.type_of_food,
      portion_size: payload.portion_size,
      number_of_calories: payload.number_of_calories,
      water_intake: payload.water_intake || "0",
      created_date: ic.time(),
      updated_at: Opt.None,
    };
    foodIntakeStorage.insert(newFoodIntake.id, newFoodIntake);
    return Result.Ok(newFoodIntake);
  } catch (error) {
    return Result.Err<FoodIntake, string>(`Error while adding activity`);
  }
}

$update; //function to food  intake
export function updateFoodIntake(
  id: string,
  payload: FoodIntakePayload
): Result<FoodIntake, string> {
  return match(foodIntakeStorage.get(id), {
    Some: (calories) => {
      const updateCalorieIntake: FoodIntake = {
        ...calories,
        ...payload,
        updated_at: Opt.Some(ic.time()),
      };
      foodIntakeStorage.insert(calories.id, updateCalorieIntake);
      return Result.Ok<FoodIntake, string>(updateCalorieIntake);
    },
    None: () =>
      Result.Err<FoodIntake, string>(`Invalid id:${id} does not exist`),
  });
}

$query; //function to get all calorie intake
export function getAllFoodtake(): Vec<FoodIntake> {
  return foodIntakeStorage.values();
}

$query; //function to get calorie intake by id
export function getFoodIntakeById(id: string): Result<FoodIntake, string> {
  return match(foodIntakeStorage.get(id), {
    Some: (calories) => {
      return Result.Ok<FoodIntake, string>(calories);
    },
    None: () =>
      Result.Err<FoodIntake, string>(
        `Calorie Intake with the id:${id}  does not exist`
      ),
  });
}

//function to delete calorie intake
$update;
export function deleteFoodIntake(id: string): Result<FoodIntake, string> {
  return match(foodIntakeStorage.get(id), {
    Some: (calories) => {
      foodIntakeStorage.remove(id);
      return Result.Ok<FoodIntake, string>(calories);
    },
    None: () =>
      Result.Err<FoodIntake, string>(
        `Calorie Intake with the id:${id}  does not exist`
      ),
  });
}


//uuid config
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
