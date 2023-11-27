// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![cfg(target_os = "macos")]
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{Manager, SystemTray, SystemTrayEvent};
use tauri_plugin_positioner::{Position, WindowExt};

#[derive(Serialize, Deserialize)]
struct Config {
    connectors: ConnectorsConfig,
}

#[derive(Serialize, Deserialize)]
struct ConnectorsConfig {
    api: Option<ApiConnectorConfig>,
    slack: Option<SlackConnectorConfig>,
}

#[derive(Serialize, Deserialize)]
struct ApiConnectorConfig {
    read_url: String,
    write_url: String,
    data: serde_json::Value,
    enabled: bool,
}

#[derive(Serialize, Deserialize)]
struct SlackConnectorConfig {
    // Example:
    token: String,
    enabled: bool,
}

#[tauri::command]
fn read_config() -> Result<Config, String> {
    let mut config_path = PathBuf::from(std::env::var("HOME").map_err(|e| e.to_string())?);
    config_path.push(".pulse.json");

    let config_str = fs::read_to_string(config_path).map_err(|e| e.to_string())?;

    serde_json::from_str(&config_str).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![read_config])
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new())
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();
                    let _ = window.move_window(Position::TrayCenter);

                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "quit" => app.exit(0),
                    _ => {}
                },
                _ => {}
            }
        })
        .on_window_event(|event| match event.event() {
            // tauri::WindowEvent::Focused(is_focused) => {
            //     // detect click outside of the focused window and hide the app
            //     if !is_focused {
            //         event.window().hide().unwrap();
            //     }
            // }
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
