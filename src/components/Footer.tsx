export default function Footer(){

    return(
        <>
        <footer className="w-full relative min-h-[15vh] border-t border-blue-400/20 z-10 flex items-center justify-center bg-blue-950/30 backdrop-blur-md">
            <div className="max-w-6xl mx-auto  flex flex-col">
            <div className="grid md:grid-cols-4 gap-8 py-5 ">
              <div>
                <h4 className="text-white font-semibold mb-4">О проекте</h4>
                <p className="text-blue-300 text-sm leading-relaxed">
                  Инновационная платформа для создания 3D моделей с помощью искусственного интеллекта.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Навигация</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                      Главная
                    </a>
                  </li>
                  <li>
                    <a href="/creating" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                      Создание
                    </a>
                  </li>
                  <li>
                    <a href="/profile" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                      Профиль
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Ресурсы</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                      Документация
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                      Примеры
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                      Поддержка
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Контакты</h4>
                <ul className="space-y-2">
                  <li className="text-blue-300 text-sm">info@zapusk.io</li>
                  <li className="text-blue-300 text-sm">+7 (XXX) XXX-XX-XX</li>
                </ul>
              </div>
            </div>

            <div className="text-center py-4 border-t border-blue-400/10 flex items-center justify-center">
              <p className="text-blue-400 text-sm">
                © 2026 Zapusk. Все права защищены.
              </p>
            </div>
          </div>
        </footer>
        </>
    )
}