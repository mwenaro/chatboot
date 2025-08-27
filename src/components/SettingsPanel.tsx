import { useState } from 'react'
import { Settings, Download, Trash2, Moon, Sun } from 'lucide-react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  onClearChat: () => void
  onExportChat: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export default function SettingsPanel({
  isOpen,
  onClose,
  onClearChat,
  onExportChat,
  darkMode,
  onToggleDarkMode
}: SettingsPanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <button
            onClick={onExportChat}
            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download size={20} className="text-blue-600" />
            <div>
              <p className="text-gray-800 dark:text-white font-medium">Export Chat</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Save conversation as text file</p>
            </div>
          </button>

          <button
            onClick={onClearChat}
            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
          >
            <Trash2 size={20} />
            <div>
              <p className="font-medium">Clear Chat History</p>
              <p className="text-sm text-red-500 dark:text-red-400">This action cannot be undone</p>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Resume Chatbot v1.0 - Your AI Career Assistant
          </p>
        </div>
      </div>
    </div>
  )
}
