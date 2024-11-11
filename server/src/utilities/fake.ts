import { faker } from "@faker-js/faker";

import ComicModel from "../database/model/ComicModel";

export const generateRandomComments = () => {
  const numComments = faker.number.int({ min: 5, max: 15 });
  const comments = [];

  for (let i = 0; i < numComments; i++) {
    const comment = {
      content: faker.lorem.sentence(),
      name: faker.finance.accountName(),
      replies: [],
    };

    const numReplies = faker.number.int({ min: 0, max: 5 });
    for (let j = 0; j < numReplies; j++) {
      const reply = {
        rep_content: faker.lorem.sentence(),
        rep_name: faker.finance.accountName(),
      };
      comment.replies.push(reply as never);
    }

    comments.push(comment);
  }

  return comments;
};

export function generateNotify() {
  return faker.lorem.sentence();
}

export const generateRandomRates = () => {
  const numRates = faker.number.int({ min: 1, max: 10 });
  const rates = [];

  for (let i = 0; i < numRates; i++) {
    const rate = {
      star_number: faker.number.int({ min: 1, max: 10 }),
    };
    rates.push(rate);
  }

  return rates;
};

export const generateRandomViews = () => {
  return faker.number.int({ min: 10000, max: 100000 });
};

export const addRandomDataToFilm = async (filmId: any) => {
  try {
    const comic = await ComicModel.findById(filmId);

    if (!comic) {
      console.log("Film not found");
      return;
    }

    // film.comments = generateRandomComments() as any;
    comic.rate = generateRandomRates() as any;
    // comic.views = generateRandomViews() as any;
    comic.notify = generateNotify() as any;

    await comic.save();

    console.log(`Random data added to film ${filmId} successfully`);
  } catch (error) {
    console.error("Error adding random data:", error);
  }
};

// Thêm dữ liệu ngẫu nhiên cho tất cả các phim trong database
export const addRandomDataToAllFilms = async () => {
  try {
    const films = await ComicModel.find();

    for (const film of films) {
      await addRandomDataToFilm(film._id);
    }

    console.log("Random data added to all films successfully");
  } catch (error) {
    console.error("Error adding random data to all films:", error);
  }
};
