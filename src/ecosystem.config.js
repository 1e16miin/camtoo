module.exports = {
  apps: [
    {
      name: "app",
      script: "./app.js",
      instances: max,
      exec_mode: "cluster",
      instance_var: "INSTANCE_ID",
    },
  ],
};