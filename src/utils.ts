import chalk from "chalk";

export const mode = (data: any) => {
  return data
    .sort((a: any, b: any) => {
      return (
        data.filter((item: any) => item === a).length -
        data.filter((item: any) => item === b).length
      );
    })
    .pop();
};

export const log = {
  info: (message: string) => {
    console.log(chalk.blue(message));
    console.log("---------------------------");
  },
  error: (message: string) => {
    console.log(chalk.red(message));
    console.log("---------------------------");
  },
  success: (message: string) => {
    console.log(chalk.green(message));
    console.log("---------------------------");
  },
};
