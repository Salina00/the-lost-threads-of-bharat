const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questions = [
  // Musical Instruments
  {
    category: 'musical_instruments',
    question: 'Which ancient stringed instrument is associated with the Goddess of Learning, Saraswati?',
    options: ['Sitar', 'Veena', 'Sarod', 'Santur'],
    answer: 'Veena'
  },
  {
    category: 'musical_instruments',
    question: 'Who is widely regarded as the maestro who popularized the Sitar globally in the 20th century?',
    options: ['Ustad Bismillah Khan', 'Pandit Ravi Shankar', 'Zakir Hussain', 'Hariprasad Chaurasia'],
    answer: 'Pandit Ravi Shankar'
  },
  {
    category: 'musical_instruments',
    question: 'The Santoor, a classical stringed instrument, originates from which region of India?',
    options: ['Kashmir', 'Kerala', 'Rajasthan', 'Assam'],
    answer: 'Kashmir'
  },
  {
    category: 'musical_instruments',
    question: 'Which double-reeded wind instrument is traditionally played during auspicious ceremonies and weddings in North India?',
    options: ['Flute', 'Shehnai', 'Nadaswaram', 'Pungi'],
    answer: 'Shehnai'
  },
  {
    category: 'musical_instruments',
    question: 'Which Indian percussion instrument consists of a pair of hand drums and is central to Hindustani classical music?',
    options: ['Mridangam', 'Tabla', 'Ghatam', 'Dholak'],
    answer: 'Tabla'
  },

  // Monuments
  {
    category: 'monuments',
    question: 'Which ancient university in Bihar was a major Buddhist center of learning from the 5th century CE to 1200 CE?',
    options: ['Takshashila', 'Nalanda', 'Vikramashila', 'Valabhi'],
    answer: 'Nalanda'
  },
  {
    category: 'monuments',
    question: 'The Sun Temple, famous for its chariot-like architecture, is located in which town?',
    options: ['Konark', 'Madurai', 'Hampi', 'Thanjavur'],
    answer: 'Konark'
  },
  {
    category: 'monuments',
    question: 'Which monument in Hyderabad was built in 1591 to commemorate the end of a deadly plague?',
    options: ['Golconda Fort', 'Charminar', 'Qutb Minar', 'Mecca Masjid'],
    answer: 'Charminar'
  },
  {
    category: 'monuments',
    question: 'The Kailasa Temple, carved out of a single rock cliff, is located in which cave complex?',
    options: ['Ajanta', 'Ellora', 'Elephanta', 'Bhaja'],
    answer: 'Ellora'
  },
  {
    category: 'monuments',
    question: 'Which medieval ruins in Karnataka represent the capital of the Vijayanagara Empire?',
    options: ['Hampi', 'Pattadakal', 'Badami', 'Aihole'],
    answer: 'Hampi'
  },

  // Literature
  {
    category: 'literature',
    question: 'Who wrote the ancient Indian Sanskrit play "Abhijnanashakuntalam"?',
    options: ['Bhasa', 'Kalidasa', 'Shudraka', 'Banabhatta'],
    answer: 'Kalidasa'
  },
  {
    category: 'literature',
    question: 'Which epic is considered the longest poem ever written, containing over 100,000 verses?',
    options: ['Ramayana', 'Mahabharata', 'Silappadikaram', 'Manimekalai'],
    answer: 'Mahabharata'
  },
  {
    category: 'literature',
    question: 'The "Panchatantra", a collection of animal fables and moral stories, was composed by whom?',
    options: ['Vishnu Sharma', 'Chanakya', 'Valmiki', 'Vyas'],
    answer: 'Vishnu Sharma'
  },
  {
    category: 'literature',
    question: 'Which ancient text is primarily a treatise on statecraft, economic policy, and military strategy, attributed to Kautilya?',
    options: ['Manusmriti', 'Arthashastra', 'Kamasutra', 'Charaka Samhita'],
    answer: 'Arthashastra'
  },
  {
    category: 'literature',
    question: 'For which collection of poems did Rabindranath Tagore win the Nobel Prize in Literature in 1913?',
    options: ['Gora', 'Gitanjali', 'Ghare Baire', 'Chokher Bali'],
    answer: 'Gitanjali'
  },

  // Festivals
  {
    category: 'festivals',
    question: 'Which harvest festival in Kerala is celebrated with flower carpets (Pookalam) and snake boat races?',
    options: ['Pongal', 'Onam', 'Vishu', 'Bihu'],
    answer: 'Onam'
  },
  {
    category: 'festivals',
    question: 'Hornbill Festival, celebrating rich tribal heritage, is organized annually in which Indian state?',
    options: ['Nagaland', 'Meghalaya', 'Mizoram', 'Arunachal Pradesh'],
    answer: 'Nagaland'
  },
  {
    category: 'festivals',
    question: 'Which festival in Maharashtra features the installation of clay idols and is celebrated with grand public processions?',
    options: ['Durga Puja', 'Ganesh Chaturthi', 'Janmashtami', 'Gudi Padwa'],
    answer: 'Ganesh Chaturthi'
  },
  {
    category: 'festivals',
    question: 'Which festival is widely known as the "Festival of Colors", marking the arrival of spring?',
    options: ['Holi', 'Diwali', 'Baisakhi', 'Makar Sankranti'],
    answer: 'Holi'
  },
  {
    category: 'festivals',
    question: 'Durga Puja is the most prominent socio-cultural festival of which Indian state?',
    options: ['West Bengal', 'Odisha', 'Assam', 'Bihar'],
    answer: 'West Bengal'
  },

  // Paintings
  {
    category: 'paintings',
    question: 'Which traditional style of painting, depicting mythological stories on cloth scrolls, originates from Odisha?',
    options: ['Madhubani', 'Pattachitra', 'Warli', 'Kalighat'],
    answer: 'Pattachitra'
  },
  {
    category: 'paintings',
    question: 'Madhubani painting, featuring vibrant colors and geometric patterns, is native to which state?',
    options: ['Rajasthan', 'Bihar', 'Uttar Pradesh', 'Gujarat'],
    answer: 'Bihar'
  },
  {
    category: 'paintings',
    question: 'Which tribal art form, using simple geometric shapes (circles, triangles, squares), originates from Maharashtra?',
    options: ['Warli', 'Gond', 'Phad', 'Kalamkari'],
    answer: 'Warli'
  },
  {
    category: 'paintings',
    question: 'Which style of painting from Andhra Pradesh uses natural dyes and a bamboo pen (kalam) for freehand drawing?',
    options: ['Kalamkari', 'Tanjore', 'Miniature', 'Cheriyal'],
    answer: 'Kalamkari'
  },
  {
    category: 'paintings',
    question: 'Tanjore paintings, known for their rich colors and gold leaf embellishments, originated in which dynasty?',
    options: ['Chola Dynasty', 'Maratha Rule in Tanjore', 'Pallava Dynasty', 'Pandya Dynasty'],
    answer: 'Maratha Rule in Tanjore'
  },

  // Historical Figures
  {
    category: 'historical_figures',
    question: 'Which Mauryan Emperor renounced violence and embraced Buddhism after the Kalinga War?',
    options: ['Chandragupta Maurya', 'Bindusara', 'Ashoka the Great', 'Brihadratha'],
    answer: 'Ashoka the Great'
  },
  {
    category: 'historical_figures',
    question: 'Which legendary king of the Chola Dynasty expanded his empire overseas to Southeast Asia and built the Brihadisvara Temple?',
    options: ['Rajaraja Chola I', 'Rajendra Chola I', 'Karikala Chola', 'Aditya Chola I'],
    answer: 'Rajaraja Chola I'
  },
  {
    category: 'historical_figures',
    question: 'Who was the Maratha ruler who established the Maratha Empire and was crowned as Chhatrapati in 1674?',
    options: ['Shivaji Maharaj', 'Sambhaji Maharaj', 'Baji Rao I', 'Shahji Bhonsle'],
    answer: 'Shivaji Maharaj'
  },
  {
    category: 'historical_figures',
    question: 'Which 16th-century Mughal emperor is famous for establishing the syncretic religion "Din-i Ilahi"?',
    options: ['Babur', 'Humayun', 'Akbar', 'Shah Jahan'],
    answer: 'Akbar'
  },
  {
    category: 'historical_figures',
    question: 'Which warrior queen of Jhansi played a leading role in the Indian Rebellion of 1857?',
    options: ['Rani Lakshmibai', 'Rani Chennamma', 'Begum Hazrat Mahal', 'Rani Durgavati'],
    answer: 'Rani Lakshmibai'
  }
];

const seedDB = async () => {
  try {
    const connURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_threads_of_bharat';
    await mongoose.connect(connURI);
    console.log('Connected to database for seeding...');

    await Question.deleteMany();
    console.log('Cleared existing questions.');

    await Question.insertMany(questions);
    console.log('Seeded database with Indian heritage questions successfully!');

    mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
