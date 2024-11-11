export function toCapitalize(inputText: string) {
  // Tách đoạn văn bản thành các từ
  const words = inputText.split(" ");

  // Lặp qua từng từ và chuyển đổi chữ cái đầu thành chữ hoa
  const capitalizedWords = words.map((word) => {
    // Nếu từ rỗng, không cần chuyển đổi
    if (word.length === 0) {
      return "";
    }

    // Chuyển đổi chữ cái đầu của từ
    const capitalizedWord =
      word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase();

    return capitalizedWord;
  });

  // Kết hợp lại các từ thành đoạn văn bản mới
  const resultText = capitalizedWords.join(" ");

  return resultText;
}

export function convertToSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (char) => (char === "đ" ? "d" : "D"))
    .replace(/[^a-z0-9]/g, "-");
}

export function generateString(length: any) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Example of improved retry logic with exponential backoff
export async function retryWithExponentialBackoff(
  fn: () => Promise<any>,
  maxRetries: number,
  delayMs: number
): Promise<any> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (retries === maxRetries) {
        console.error(`All ${maxRetries} retries failed. Returning null.`);
        return null;
      }
      console.error(`Retry attempt ${retries + 1} failed:`, error.message);
      retries++;
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * Math.pow(2, retries))
      );
    }
  }
  console.error(`All ${maxRetries} retries failed. Returning null.`);
  return null;
}

export function removeVietnameseAccent(str: string) {
  const isVietnamese = /[^\u0000-\u007F]/.test(str);
  if (!isVietnamese) {
    return {
      lower: str.toLowerCase(),
      normal: str,
    };
  }
  // remove accents
  const from =
    "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ";
  const to =
    "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }

  // str = str.toLowerCase()
  //       .trim()
  //       .replace(/[^a-z0-9\-]/g, '-')
  //       .replace(/-+/g, '-');

  return {
    lower: str.toLowerCase(),
    normal: str,
  };
}

export function addKeywords(dataText: string[] | string) {
  const str = !Array.isArray(dataText) ? [dataText] : dataText;
  const keywords: string[] = [];
  const newKeywords: string[] = [];

  if (dataText.length > 0) {
    str.forEach((text) => {
      const isVietnamese = /[^\u0000-\u007F]/.test(text);
      keywords.push(text);
      if (isVietnamese) {
        const res = removeVietnameseAccent(text);
        keywords.push(res.lower, res.normal);
      }
      const otherVersions = [
        "story book",
        "comic full",
        "comic",
        "truyện",
        "truyện Việt hoá",
        "truyện dịch",
        "dịch full",
        "truyện dịch Tiếng Việt",
        "truyện full tiếng Việt",
        "truyen Viet hoa",
        "truyen dich",
        "dich full",
        "truyen dich tieng Viet",
        "truyen full tieng Viet",
        "truyen",
      ];

      keywords.forEach((keyword) => {
        otherVersions.forEach((e) => {
          newKeywords.push(keyword + " " + e);
        });
      });
    });
  }

  return [...keywords, ...newKeywords];
}

// Hàm để escape các ký tự đặc biệt
export function escapeRegex(keyword: string) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& là chuỗi khớp với toàn bộ regex
}

export function getStartOfWeek() {
  const now = new Date();
  const firstDayOfWeek = now.getDate() - now.getDay(); // Lấy ngày đầu tuần (Chủ nhật)
  const startOfWeek = new Date(now.setDate(firstDayOfWeek));
  startOfWeek.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
  return startOfWeek;
}

export function getEndOfWeek() {
  const now = new Date();
  const lastDayOfWeek = now.getDate() + (6 - now.getDay()); // Lấy ngày cuối tuần (Thứ bảy)
  const endOfWeek = new Date(now.setDate(lastDayOfWeek));
  endOfWeek.setHours(23, 59, 59, 999); // Đặt thời gian về 23:59:59
  return endOfWeek;
}
