import express from "express";
import { google } from "googleapis";

const router = express.Router();

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Fetch de dados de sono
router.get("/sleep/:startDate/:endDate", async (req, res) => {
  try {
    const fitness = google.fitness({ version: "v1", auth: req.oAuth2Client });

    const startDate = new Date(`${req.params.startDate}T00:00:00`);
    const endDate = new Date(`${req.params.endDate}T23:59:59`);

    const response = await fitness.users.sessions.list({
      userId: "me",
      startTime: startDate,
      endTime: endDate,
    });

    const sleepDuration = response.data.session
      .filter((session) => session.activityType === 72) // Filtrar por sono
      .map((sleep) => {
        let date = new Date(sleep.endTimeMillis - sleep.startTimeMillis); // Millis -> Data
        // let duration = date.substring(11, 13) + "." + date.substring(14,16); // h.m
        let duration = date.getHours();
        return duration;
      });

    res.json(sleepDuration);
    // res.json(response);
  } catch (error) {
    console.error(error);
  }
});

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Fetch de dados de distância
router.get("/distance/:startDate/:endDate", async (req, res) => {
  const fitness = google.fitness({ version: "v1", auth: req.oAuth2Client });

  try {
    const startDate = new Date(`${req.params.startDate}T00:00:00`);
    const endDate = new Date(`${req.params.endDate}T23:59:59`);

    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: "com.google.distance.delta",
          },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startDate.getTime(),
        endTimeMillis: endDate.getTime(),
      },
    });

    let distance = response.data.bucket.flatMap(
      (bucket) => Math.round(bucket.dataset[0].point[0].value[0].fpVal / 1000) // Converter em km
    );

    res.json(distance);
  } catch (error) {
    res.send("Não existem dados a mostrar");
  }
});

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Fetch de dados de atividade
const activityTypes = [1, 7, 8, 12, 29, 80, 82, 108]; // Bicicleta / Caminhada / Corrida / Basquete / Futebol / Treino de Força / Natação / Outros
router.get("/activity/:startDate/:endDate", async (req, res) => {
  try {
    const fitness = google.fitness({ version: "v1", auth: req.oAuth2Client });

    const startDate = new Date(`${req.params.startDate}T00:00:00`);
    const endDate = new Date(`${req.params.endDate}T23:59:59`);

    const response = await fitness.users.sessions.list({
      userId: "me",
      startTime: startDate,
      endTime: endDate,
    });

    const activityData = response.data.session
      .filter((session) => activityTypes.includes(session.activityType)) // Filtrar por tipos de atividade
      .map((activity) => {
        let type = activity.activityType;

        let startTime = new Date(parseInt(activity.startTimeMillis, 10));
        let dayTime = startTime.getHours();

        let duration = activity.endTimeMillis - activity.startTimeMillis;

        return { type, startTime, dayTime, duration };
      });

    // Filtrar uma atividade por dia apenas (maior duração)
    const dayActivities = {};
    for (let i = 0; i < activityData.length; i++) {
      const date = activityData[i].startTime.toISOString().split("T")[0];

      if (!dayActivities[date] || activityData[i].duration > dayActivities[date].duration) {
        dayActivities[date] = activityData[i];
      }
    }
    const finalActivities = Object.values(dayActivities);

    res.json(finalActivities);
  } catch (error) {
    console.error(error);
  }
});

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Fetch de tempo em movimento
router.get("/active_minutes/:startDate/:endDate", async (req, res) => {
  const fitness = google.fitness({ version: "v1", auth: req.oAuth2Client });

  try {
    const startDate = new Date(`${req.params.startDate}T00:00:00`);
    const endDate = new Date(`${req.params.endDate}T23:59:59`);

    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          {
            dataTypeName: "com.google.active_minutes",
          },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startDate.getTime(),
        endTimeMillis: endDate.getTime(),
      },
    });

    let time = response.data.bucket.flatMap((bucket) => bucket.dataset[0].point[0].value[0].intVal);

    res.json(time);
  } catch (error) {
    res.send("Não existem dados a mostrar");
  }
});

export default router;
