export const mode = (data) => {
  return data
    .sort((a, b) => {
      return (
        data.filter((item) => item === a).length -
        data.filter((item) => item === b).length
      );
    })
    .pop();
};

export const log = (text) => {
  console.log(text);
  console.log("---------------------------");
};
