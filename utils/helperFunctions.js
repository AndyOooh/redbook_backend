export const nameCase = name => {
  return name[0].toUpperCase() + name.slice(1).toLowerCase();
};

export const updateNestedObject = (obj, path, value) => {
  // assuming path is in dot-notation. It should include the property to update.
  const pathArray = path.split('.');
  let propertyToUpdate = pathArray.pop(); //alwasy the last.
  let objectRef = obj; // point to the same ref. The ref changes withe every iteration. In the end we modify the original object by setting a value but only for the nested property.

  while (pathArray.length > 0) {
    objectRef = objectRef[pathArray.shift()];
  }
  objectRef[propertyToUpdate] = value;
  return obj; //return the original as the ref only contains values from pathArray.length - 1 levels and  down.
};
