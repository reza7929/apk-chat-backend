## مستند معماری

این سورس کد بک اند برنامه چت آنلاین میباشد. شما میتوانید جزیئات برنامه را در لینک زیر ببینید:
[front-end-repo](https://github.com/reza7929/apk-chat-front)

## مستند نحوه ی پیاده سازی

این سورس کد از پکیج [dotenv](https://www.npmjs.com/package/dotenv) برای ادرس ها از قبیل آدرس [mongodb](https://www.mongodb.com/) و همچنین [پرایوت کی jwt](https://jwt.io/introduction) استفاده میکند. لذا هنگام قرار گرفتن کدها این فایل باید در gitignore قرار بگیرد تا امنیت [توکن](https://www.npmjs.com/package/jsonwebtoken) و همچنین ادرس ها برقرار بماند.

برای اجرای کدهای backend، دستور زیر را واردکنید:

```bash
yarn start # yarn & nodemon index.js with production env
```

## مستند عملکرد برنامه

این برنامه از پکیج [http](https://www.npmjs.com/package/http) برای ساخت سرور استفاده میکند که اکنون پورت backend بر روی 5000 تنظیم شده است.

از پکیچ [express](https://www.npmjs.com/package/express) برای ارسال و دریافت درخواست ها، [cors](https://www.npmjs.com/package/cores) برای قبولی درخواست توسط سرور از طریق http، [bodyParser](https://www.npmjs.com/package/body-parser) برای گرفتن اطلاعات body از درخواست ها استفاده شده است. همچنین از پکیج [socket.io](https://www.npmjs.com/package/socket.io) برای ایجاد ارتباط real-time برای قسمت چت برنامه و همچنین بروزرسانی اطلاعات کاربران استفاده شده است.

عملگر backen درهنگام اتصال کاربر به سایت به شرح زیر میباشد:

ابتدا اتصال کاربر به دیتابیس [mongodb](https://www.mongodb.com/) از طریق پکیج [mongoose](https://www.npmjs.com/package/mongoose) صورت میگیرد و پس از آن منتظر فعال سازی کانکشن [socket-io](https://www.npmjs.com/package/socketio) میشود. پس از اتصال کاربر و ورود او اطلاعات کاربر از طریق آی دی که هنگام برقراری کانکشن به سرور ارسال شده است بروز رسانی میشود و و ضعیت کاربر را آنلاین نشان میدهد.

در بخش allUsers در [socket-io](https://www.npmjs.com/package/socketio) کانکشن اطلاعات کاربران فعال خواهد شد و از طریق allUsersRes این اطلاعات به سمت کاربر ارسال می شود

در بخش allMassages نیز تمام پیام های موجود تا زمانی که کاربر به پروفایل مقابل کلیک کرده گرفته میشود و از طریق massagesRes این اطلاعات به سمت هدف فرستاده میشود

در بخش sendMessage در [socket-io](https://www.npmjs.com/package/socketio) ضمن اینکه اطلاعات پیام در سرور ذخیره خواهد شد و بعد از ذخیره سازی اطلاعات پیام ارسالی از طریق سرور [socket-io](https://www.npmjs.com/package/socketio) به اتاق مشترک میان دو کاربر ارسال خواهد شد تا بتوانند پیامی را که فرستاده اند را دریافت کنند.

بخش دیگری در [socket-io](https://www.npmjs.com/package/socketio) ایجاد شده است که leaveRoom نام دارد و وظیفه آن خروج کاربر از room میباشد که زمانی که کاربر بر روی کانکشن دیگر کلیک کرد، کانکشن فعلی قطع شود.

در بخش آخر [socket-io](https://www.npmjs.com/package/socketio) که disconnect نام دارد زمانی فعال میشود که ارتباط کاربر با [socket-io](https://www.npmjs.com/package/socketio) قطع شده باشد. به عبارتی کاربر خارج شده باشد و همین امر باعت offline شدن و بروزرسانی اطلاعات کاربر میباشد

دربخش بعد که route ها دسترسی داریم که دارای سه بخش اصلی میباشد:

1- بخش auth که فایل `middleware/auth` اجرا خواهد شد که وظیفه ی اصلی آن بررسی [توکن](https://www.npmjs.com/package/jsonwebtoken) ارسالی از سمت کاربر و ارسال نتیجه میباشد

2-بخش register که فایل `routes/register` اجرا خواهد شد و وظیفه ی آن ثبت نام کاربر، ثبت اطلاعات در دیتابیس، ساخت [توکن](https://www.npmjs.com/package/jsonwebtoken) و ارسال [توکن](https://www.npmjs.com/package/jsonwebtoken) به سمت کاربر است.

3-بخش login که فایل آن `routes/login` میباشد و وظیفه آن بررسی اطلاعات کاربر و چک کردن پسورد میباشد که درصورت صحیح بودن پسورد [توکن](https://www.npmjs.com/package/jsonwebtoken) ایجاد خواهد شد و به سمت کاربر ارسال خواهد شد.
